import { Elysia } from "elysia";
import { ShortcutPayload } from "./types/slashCommandPayload";
import { getActionValue, openModal, publishHomeTab, updateModal } from "./utils/slack";
import { BlockActionsPayload } from "./types/slackEvent";
import bot from "..";
import { INIT_ACTION_ID, INIT_MODAL_NAME } from "./consts";
import { Action } from "./bot";
import { HeaderBlock } from "@slack/web-api";
import { ChannelType } from "./types/handlerInputs";

const actionsBlocks = [
	{
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": "Pick an item from the dropdown list"
		},
		"accessory": {
			"type": "static_select",
			"placeholder": {
				"type": "plain_text",
				"text": "Select an item",
				"emoji": true
			},
			"options": Object.values(bot.getActions()).map(action => {
				return {
					"text": {
						"type": "plain_text",
						"text": action.name,
						"emoji": true
					},
					"value": action.name
				}
			}),
			"action_id": INIT_ACTION_ID
		}
	}
]

const app = new Elysia()
app.get("/", () => "Hello Elysia")
app.post("/slack/events", async ({ body }: { body: any }) => {
	if (body.challenge) {
		return body.challenge;
	}
	else if (body.event && body.event.type === "app_home_opened") {
		console.log("APP HOME OPENED", body)
		await publishHomeTab(body.event.user, actionsBlocks, "Barbell cURL");
	}

	else if (body.payload) {
		console.log("Body", body)
		const payload = JSON.parse(body.payload)
		console.log("Slash Command Payload", payload)
		if (payload.type === "shortcut") {
			const shortcutPayload = payload as ShortcutPayload
			await openModal(shortcutPayload.trigger_id, actionsBlocks, INIT_MODAL_NAME)
		}
		else if (payload.type === "block_actions") {
			const blockActionsPayload = payload as BlockActionsPayload
			console.log("Block Actions Payload", blockActionsPayload)
			const actionInput = blockActionsPayload.actions[0]
			if (actionInput.action_id !== INIT_ACTION_ID) {
				if (blockActionsPayload.view.state) {
					const { state } = blockActionsPayload.view
					const inputs = Array.from(Object.values(state.values))
					const actionName = (blockActionsPayload.view.type === 'modal') ? blockActionsPayload.view.title.text : (blockActionsPayload.view.blocks[0] as HeaderBlock).text.text
					console.log("GOT INPUTS", actionName, inputs)
					const action = bot.getAction(actionName)
					if (action === undefined) throw new Error("Action not found")
					// inputs is a list of {key: object} -> flatten this into one object
					const flattenedInputs = inputs.reduce((acc, input) => {
						const key = Object.keys(input)[0];
						acc[key] = input[key];
						return acc;
					}, {});
					console.log("FLATTENED INPUTS", flattenedInputs);
					const buttonClick = blockActionsPayload.actions.filter(action => action.type === "button").map(action => ({
						action: action.action_id,
						value: action.value
					}))?.[0];
					console.log("BUTTON CLICK", buttonClick)
					const blocks = await action.run(blockActionsPayload.user.id, blockActionsPayload.view.type, blockActionsPayload.view.type as ChannelType, flattenedInputs, buttonClick)
					console.log("RENDERING BLOCKS", blocks)
					if (blockActionsPayload.view.type === 'modal') {
						await updateModal(blockActionsPayload.view.id, blocks, action.name, "Submit")
					}
					else {
						await publishHomeTab(blockActionsPayload.user.id, blocks, action.name)
					}
				}
				return
			}
			else {
				const intendedAction = getActionValue(actionInput)
				const action = bot.getAction(intendedAction)
				const blocks = await action.run(blockActionsPayload.user.id, blockActionsPayload.view.type, blockActionsPayload.view.type as ChannelType)
				if (blockActionsPayload.view.type === 'modal') {
					await updateModal(blockActionsPayload.view.id, blocks, action.name, "Submit")
				}
				else {
					await publishHomeTab(blockActionsPayload.user.id, blocks, action.name)
				}
				return
			}
		}
		else console.log("No payload tag", JSON.parse(body.payload))
	}
	else {
		console.log("Unhandled event", body)
	}
})
app.listen(3000);


console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
