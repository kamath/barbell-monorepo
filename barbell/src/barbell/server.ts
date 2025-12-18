import { Hono } from "hono";
import { ENVIRONMENT } from "./consts";
import { buildBlocks } from "./utils/buildBlocks";
import { getSlackClient, sendMessage } from "./utils/slack";

const app = new Hono<{ Bindings: Env }>();
app.get("/", (c) => {
	return c.json({ status: 200, ENVIRONMENT });
});
app.post("/slack/events", async (c) => {
	// Slack sends form-encoded data for interactive components, JSON for events
	const contentType = c.req.header("content-type") || "";
	let body: any;
	if (contentType.includes("application/x-www-form-urlencoded")) {
		body = await c.req.parseBody();
	} else {
		body = await c.req.json();
	}

	if (body.challenge) {
		return c.text(body.challenge);
	} else if (body.event) {
		switch (body.event.type) {
			case "app_home_opened":
				console.log("APP HOME OPENED", JSON.stringify(body, null, 2));
				break;
			case "slash_command":
				console.log("SLASH COMMAND PAYLOAD", JSON.stringify(body, null, 2));
				break;
			case "app_mention": {
				console.log("APP MENTION", JSON.stringify(body, null, 2));
				const blocks = buildBlocks();
				await sendMessage(
					getSlackClient(c.env),
					blocks.blocks,
					body.event.channel,
					body.event.ts,
					false,
				);
				break;
			}
		}
		return c.text("");
	} else if (body.payload) {
		const payload = JSON.parse(body.payload);
		console.log("Command Payload", payload);
	} else {
		console.log("Unhandled event", JSON.stringify(body, null, 2));
	}
	return c.text("");
});

export default {
	fetch: app.fetch,
};
