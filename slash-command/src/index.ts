import { Elysia } from "elysia";
import { ShortcutPayload } from "./types/slashCommandPayload";
import { getActionValue, openModal, updateModal } from "./utils/slack";
import { BlockActionsPayload } from "./types/slackEvent";
import bot from "./actions";

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
					text: "Barbell cURL"
				},
				submit: {
					type: "plain_text",
					text: "Submit"
				},
				blocks: [
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
							"action_id": "static_select-action"
						}
					}
				]
			});
		}
		else if (payload.type === "block_actions") {
			const blockActionsPayload = payload as BlockActionsPayload
			console.log("Block Actions Payload", blockActionsPayload)
			const intendedAction = getActionValue(blockActionsPayload.actions[0])
			const action = bot.getAction(intendedAction)
			await updateModal(blockActionsPayload.view.id, {
				type: "modal",
				title: {
					type: "plain_text",
					text: action.name
				},
				submit: {
					type: "plain_text",
					text: "Submit"
				},
				blocks: [
					...(await action.run())
				]
			})
			return
		}
		else console.log("No payload tag", JSON.parse(body.payload))
	}
})
app.listen(3000);


console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
