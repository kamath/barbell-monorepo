import type { WorkerResponse } from "@barbell/runtime";
import type {
	BlockActionContext,
	MessageContext,
	ModalView,
} from "@barbell/sdk";
import type { ConversationsRepliesResponse } from "@slack/web-api";
import { Hono } from "hono";
import { ENVIRONMENT } from "./consts";
import type {
	AppMentionEvent,
	SlackChallenge,
	SlackEventCallback,
	SlackInteractivePayload,
	SlackWebhookPayload,
} from "./types/slack-events";
import {
	getSlackClient,
	getThreadReplies,
	openView,
	sendMessage,
} from "./utils/slack";

const app = new Hono<{ Bindings: Env }>();
app.get("/", (c) => {
	return c.json({ status: 200, ENVIRONMENT });
});
app.post("/slack/events", async (c) => {
	// Slack sends form-encoded data for interactive components, JSON for events
	const contentType = c.req.header("content-type") || "";
	let body: SlackWebhookPayload | { payload?: string };

	if (contentType.includes("application/x-www-form-urlencoded")) {
		const parsed = await c.req.parseBody();
		// Interactive components send payload as a string in form data
		if (typeof parsed.payload === "string") {
			body = JSON.parse(parsed.payload);
		} else {
			body = parsed;
		}
	} else {
		body = (await c.req.json()) satisfies SlackWebhookPayload;
	}

	// Handle URL verification challenge
	if ("challenge" in body && body.type === "url_verification") {
		const challenge: SlackChallenge = body;
		return c.text(challenge.challenge);
	}

	// Handle event callbacks
	if ("event" in body && body.type === "event_callback") {
		const eventCallback: SlackEventCallback = body;

		switch (eventCallback.event.type) {
			case "app_home_opened":
				console.log("APP HOME OPENED", JSON.stringify(eventCallback, null, 2));
				break;
			case "slash_command":
				console.log(
					"SLASH COMMAND PAYLOAD",
					JSON.stringify(eventCallback, null, 2),
				);
				break;
			case "app_mention": {
				const appMentionEvent: AppMentionEvent = eventCallback.event;
				console.log("APP MENTION", JSON.stringify(eventCallback, null, 2));
				let threadMessages:
					| ConversationsRepliesResponse["messages"]
					| undefined;

				if (appMentionEvent.thread_ts) {
					threadMessages = await getThreadReplies(
						getSlackClient(c.env),
						appMentionEvent.channel,
						appMentionEvent.thread_ts,
					);
					console.log("THREAD", JSON.stringify(threadMessages, null, 2));
				}

				// Build structured context for customer worker
				const context: MessageContext = {
					threadMessages: (threadMessages ?? []).map((msg) => ({
						user: msg.user,
						text: msg.text,
						ts: msg.ts,
						thread_ts: msg.thread_ts,
						type: msg.type,
						bot_id: msg.bot_id,
						app_id: msg.app_id,
					})),
					event: {
						channel: appMentionEvent.channel,
						user: appMentionEvent.user,
						text: appMentionEvent.text,
						ts: appMentionEvent.ts,
						thread_ts: appMentionEvent.thread_ts,
						trigger_id: appMentionEvent.trigger_id,
					},
				};

				// Dispatch to customer worker with JSON context
				const worker = c.env.DISPATCHER.get("customer-worker-1");
				const response = await worker.fetch(
					new Request("https://internal/", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(context),
					}),
				);

				// Parse the response
				const result = (await response.json()) as WorkerResponse;

				if (result.error) {
					console.error("Customer worker error:", result.message);
					await sendMessage(
						getSlackClient(c.env),
						[
							{
								type: "section",
								text: {
									type: "mrkdwn",
									text: `:warning: Error: ${result.message}`,
								},
							},
						],
						appMentionEvent.channel,
						appMentionEvent.ts,
						false,
					);
				} else if (result.blocks) {
					await sendMessage(
						getSlackClient(c.env),
						result.blocks,
						appMentionEvent.channel,
						appMentionEvent.ts,
						false,
					);
				} else if (result.view) {
					if (result.view.type === "modal" && context.event.trigger_id) {
						await openView(
							getSlackClient(c.env),
							context.event.trigger_id,
							result.view as ModalView,
						);
					}
				}
				break;
			}
		}
		return c.text("");
	}

	// Handle interactive payloads
	if ("type" in body && body.type === "block_actions") {
		const interactivePayload: SlackInteractivePayload = body;
		console.log("Interactive Payload", interactivePayload);

		// Extract channel and message info from container
		const container = interactivePayload.container as
			| {
					type?: string;
					channel_id?: string;
					message_ts?: string;
					thread_ts?: string;
			  }
			| undefined;

		const channel = container?.channel_id || "";
		const messageTs = container?.message_ts || "";
		const threadTs = container?.thread_ts;
		const userId = interactivePayload.user?.id || "";
		const triggerId = interactivePayload.trigger_id;

		// Map actions to BlockAction format
		const blockActions = (interactivePayload.actions || []).map((action) => ({
			action_id: action.action_id,
			block_id: action.block_id,
			type: action.type,
			value: action.value,
			action_ts: action.action_ts,
			text: action.text,
			selected_option: action.selected_option,
		}));

		// Build structured context for customer worker
		const context: BlockActionContext = {
			event: {
				channel,
				user: userId,
				text: "", // Interactive payloads don't have message text
				ts: messageTs,
				thread_ts: threadTs,
				trigger_id: triggerId,
			},
			blockAction: blockActions,
		};

		// Dispatch to customer worker with JSON context
		const worker = c.env.DISPATCHER.get("customer-worker-1");
		const response = await worker.fetch(
			new Request("https://internal/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(context),
			}),
		);

		// Parse the response
		const result = (await response.json()) as WorkerResponse;

		if (result.error) {
			console.error("Customer worker error:", result.message);
			await sendMessage(
				getSlackClient(c.env),
				[
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: `:warning: Error: ${result.message}`,
						},
					},
				],
				channel,
				messageTs,
				false,
			);
		} else if (result.blocks) {
			await sendMessage(
				getSlackClient(c.env),
				result.blocks,
				channel,
				messageTs,
				false,
			);
		} else if (result.view) {
			if (result.view.type === "modal" && triggerId) {
				await openView(
					getSlackClient(c.env),
					triggerId,
					result.view as ModalView,
				);
			}
		}
		return c.text("");
	}

	console.log("Unhandled event", JSON.stringify(body, null, 2));
	return c.text("");
});

export default {
	fetch: app.fetch,
};
