import { Elysia } from "elysia";
import { ShortcutPayload } from "./types/slashCommandPayload";
import { getActionValue, openModal, updateModal } from "./utils/slack";
import { BlockActionsPayload } from "./types/slackEvent";
import bot from "./actions";
import { INIT_ACTION_ID, INIT_MODAL_NAME } from "./consts";

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
					text: INIT_MODAL_NAME
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
							"action_id": INIT_ACTION_ID
						}
					}
				]
			});
		}
		else if (payload.type === "block_actions") {
			const blockActionsPayload = payload as BlockActionsPayload
			console.log("Block Actions Payload", blockActionsPayload)
			const actionInput = blockActionsPayload.actions[0]
			if (actionInput.action_id !== INIT_ACTION_ID) {
				if (blockActionsPayload.view.state) {
					const { state } = blockActionsPayload.view
					const inputs = Array.from(Object.values(state.values))
					const actionName = blockActionsPayload.view.title.text
					console.log("GOT INPUTS", actionName, inputs)
					const action = bot.getAction(actionName)
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
				}
				return
			}
			else {
				const intendedAction = getActionValue(actionInput)
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
		}
		else console.log("No payload tag", JSON.parse(body.payload))
	}
})
app.listen(3000);


console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
