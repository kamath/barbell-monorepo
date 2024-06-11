import { Elysia } from "elysia";
import { ShortcutPayload } from "./types/slashCommandPayload";
import { openModal, updateModal } from "./utils/slack";
import { BlockActionsPayload } from "./types/slackEvent";

const app = new Elysia()
app.get("/", () => "Hello Elysia")
app.post("/slack/events", async ({ body }: { body: any }) => {
	if (body.challenge) {
		return body.challenge;
	}
	else if (body.payload) {
		console.log("Body", body)
		const payload = JSON.parse(body.payload)
		console.log("Slash Command Payload", payload)
		if (payload.type === "shortcut") {
			const shortcutPayload = payload as ShortcutPayload
			await openModal(shortcutPayload.trigger_id, {
				type: "modal",
				title: {
					type: "plain_text",
					text: "Hello World"
				},
				blocks: [
					{
						"dispatch_action": true,
						"type": "input",
						"element": {
							"type": "plain_text_input",
							"action_id": "plain_text_input-action"
						},
						"label": {
							"type": "plain_text",
							"text": "Label",
							"emoji": true
						}
					},
					{
						"dispatch_action": true,
						"type": "input",
						"element": {
							"type": "plain_text_input",
							"action_id": "plain_text_input-action"
						},
						"label": {
							"type": "plain_text",
							"text": "Label",
							"emoji": true
						}
					}
				]
			});
		}
		else if (payload.type === "block_actions") {
			const blockActionsPayload = payload as BlockActionsPayload
			console.log("Block Actions Payload", blockActionsPayload)
			await updateModal(blockActionsPayload.view.id, {
				type: "modal",
				title: {
					type: "plain_text",
					text: "Hello World"
				},
				blocks: [
					{
						"dispatch_action": true,
						"type": "input",
						"element": {
							"type": "plain_text_input",
							"action_id": "plain_text_input-action"
						},
						"label": {
							"type": "plain_text",
							"text": "ahhh you pooped your pants!",
							"emoji": true
						}
					}
				]
			})
			return
		}
		else console.log("No payload tag", body)
	}
})
app.listen(3000);


console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
