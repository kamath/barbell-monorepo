import { Hono } from "hono";
import { ENVIRONMENT } from "./consts";
import type {
	AppMentionEvent,
	SlackEventCallback,
	SlackChallenge,
	SlackInteractivePayload,
	SlackWebhookPayload,
} from "./types/slack-events";
import { buildBlocks } from "./utils/buildBlocks";
import { getSlackClient, getThreadReplies, sendMessage } from "./utils/slack";
import { ConversationsRepliesResponse } from "@slack/web-api";

const app = new Hono<{ Bindings: Env }>();
app.get("/", (c) => {
	return c.json({ status: 200, ENVIRONMENT });
});
app.post("/slack/events", async (c) => {
	// Clone the request before consuming the body, so we can forward it later if needed
	const clonedRequest = c.req.raw.clone();
	
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
				const worker = c.env.DISPATCHER.get("customer-worker-1");
				const data = await worker.fetch(c.req.raw);
				const blocks = buildBlocks(threadMessages);
				await sendMessage(
					getSlackClient(c.env),
					[
						{
							type: "section",
							text: { type: "mrkdwn", text: JSON.stringify(data, null, 2) },
						},
						...blocks,
					],
					appMentionEvent.channel,
					appMentionEvent.ts,
					false,
				);
				break;
			}
		}
		return c.text("");
	}

	// Handle interactive payloads
	if ("type" in body && "actions" in body) {
		const interactivePayload: SlackInteractivePayload = body;
		console.log("Interactive Payload", interactivePayload);
		return c.text("");
	}

	// Handle payload string (from form-encoded interactive components)
	if ("payload" in body && typeof body.payload === "string") {
		const payload: SlackInteractivePayload = JSON.parse(body.payload);
		console.log("Command Payload", payload);
		return c.text("");
	}

	console.log("Unhandled event", JSON.stringify(body, null, 2));
	return c.text("");
});

export default {
	fetch: app.fetch,
};
