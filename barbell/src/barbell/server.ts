import type { HeaderBlock, WebClient } from "@slack/web-api";
import { Hono } from "hono";
import bot from "..";
import { ENVIRONMENT, INIT_ACTION_ID, INIT_MODAL_NAME } from "./consts";
import type { ChannelType } from "./types/handlerInputs";
import type { BlockActionsPayload } from "./types/slackEvent";
import type { ShortcutPayload } from "./types/slashCommandPayload";
import {
	getActionValue,
	getSlackClient,
	openModal,
	publishHomeTab,
	updateModal,
} from "./utils/slack";

const renderInitActionsBlocks = async (
	userId: string,
	channelId: string,
	channelType: ChannelType,
	slackClient: WebClient,
) => {
	const defaultAction = bot.getDefaultAction();
	const actionsBlocks = [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: defaultAction
					? "...or select a different action from the dropdown list"
					: "Select an action",
			},
			accessory: {
				type: "static_select",
				placeholder: {
					type: "plain_text",
					text: "Select an item",
					emoji: true,
				},
				options: Object.values(bot.getActions()).map((action) => {
					return {
						text: {
							type: "plain_text",
							text: action.name,
							emoji: true,
						},
						value: action.name,
					};
				}),
				action_id: INIT_ACTION_ID,
			},
		},
	];
	if (defaultAction === undefined) return actionsBlocks;
	const blocks = await defaultAction.run(
		userId,
		channelId,
		channelType,
		slackClient,
	);
	return [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: `Default Action: ${defaultAction.name}`,
				emoji: true,
			},
		},
		...blocks,
		...actionsBlocks,
	];
};

const app = new Hono<{ Bindings: Env }>();
app.get("/", (c) => {
	return c.json({ status: 200, ENVIRONMENT });
});
app.post("/slack/events", async (c) => {
	// Slack sends form-encoded data for interactive components, JSON for events
	const env = c.env;
	const slackClient = getSlackClient(env);
	const contentType = c.req.header("content-type") || "";
	let body: any;
	if (contentType.includes("application/x-www-form-urlencoded")) {
		body = await c.req.parseBody();
	} else {
		body = await c.req.json();
	}

	if (body.challenge) {
		return c.text(body.challenge);
	} else if (body.event && body.event.type === "app_home_opened") {
		console.log("APP HOME OPENED", body);
		const initBlocks = await renderInitActionsBlocks(
			body.event.user,
			"home",
			"home",
			slackClient,
		);
		await publishHomeTab(
			slackClient,
			body.event.user,
			initBlocks,
			bot.getDefaultAction()?.name || INIT_MODAL_NAME,
		);
		return c.text("");
	} else if (body.payload) {
		console.log("Body", body);
		const payload = JSON.parse(body.payload);
		console.log("Slash Command Payload", payload);
		if (payload.type === "shortcut") {
			const shortcutPayload = payload as ShortcutPayload;
			const initBlocks = await renderInitActionsBlocks(
				shortcutPayload.user.id,
				"modal",
				"modal",
				slackClient,
			);
			await openModal(
				slackClient,
				shortcutPayload.trigger_id,
				initBlocks,
				bot.getDefaultAction()?.name || INIT_MODAL_NAME,
			);
			return c.text("");
		} else if (payload.type === "block_actions") {
			const blockActionsPayload = payload as BlockActionsPayload;
			console.log("Block Actions Payload", blockActionsPayload);
			const actionInput = blockActionsPayload.actions[0];
			if (actionInput.action_id !== INIT_ACTION_ID) {
				if (blockActionsPayload.view.state) {
					const { state } = blockActionsPayload.view;
					const inputs = Array.from(Object.values(state.values));
					const actionName =
						blockActionsPayload.view.type === "modal"
							? blockActionsPayload.view.title.text
							: (blockActionsPayload.view.blocks[0] as HeaderBlock).text.text;
					console.log("GOT INPUTS", actionName, inputs);
					const action = bot.getAction(actionName);
					if (action === undefined) throw new Error("Action not found");
					// inputs is a list of {key: object} -> flatten this into one object
					const flattenedInputs = inputs
						.filter((input) => Object.keys(input)[0] !== INIT_ACTION_ID)
						.reduce((acc, input) => {
							const key = Object.keys(input)[0];
							acc[key] = input[key];
							return acc;
						}, {});
					console.log("FLATTENED INPUTS", flattenedInputs);
					const buttonClick = blockActionsPayload.actions
						.filter((action) => action.type === "button")
						.map((action) => ({
							action: action.action_id,
							value: action.value,
						}))?.[0];
					console.log("BUTTON CLICK", buttonClick);
					const blocks = await action.run(
						blockActionsPayload.user.id,
						blockActionsPayload.view.type,
						blockActionsPayload.view.type as ChannelType,
						slackClient,
						flattenedInputs,
						buttonClick,
					);
					console.log("RENDERING BLOCKS", blocks);
					if (blockActionsPayload.view.type === "modal") {
						await updateModal(
							slackClient,
							blockActionsPayload.view.id,
							blocks,
							action.name,
							"Submit",
						);
					} else {
						await publishHomeTab(
							slackClient,
							blockActionsPayload.user.id,
							blocks,
							action.name,
						);
					}
				}
				return c.text("");
			} else {
				const intendedAction = getActionValue(actionInput);
				const action = bot.getAction(intendedAction);
				const blocks = await action.run(
					blockActionsPayload.user.id,
					blockActionsPayload.view.type,
					blockActionsPayload.view.type as ChannelType,
					slackClient,
				);
				if (blockActionsPayload.view.type === "modal") {
					await updateModal(
						slackClient,
						blockActionsPayload.view.id,
						blocks,
						action.name,
						"Submit",
					);
				} else {
					await publishHomeTab(
						slackClient,
						blockActionsPayload.user.id,
						blocks,
						action.name,
					);
				}
				return c.text("");
			}
		} else console.log("No payload tag", JSON.parse(body.payload));
	} else {
		console.log("Unhandled event", body);
	}
	return c.text("");
});

export default {
	fetch: app.fetch,
};
