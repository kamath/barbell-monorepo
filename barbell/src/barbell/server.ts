import { Elysia } from "elysia";
import { ShortcutPayload } from "./types/slashCommandPayload";
import { getActionValue, openModal, publishHomeTab, updateModal } from "./utils/slack";
import { BlockActionsPayload } from "./types/slackEvent";
import bot from "..";
import { INIT_ACTION_ID, INIT_MODAL_NAME } from "./consts";
import { Action } from "./bot";
import { HeaderBlock } from "@slack/web-api";
import { BlockPromptConstructor, BlockPromptSkeleton, BlockModalConstructor } from "./payload/prompt";

type SlackPayload = ShortcutPayload | BlockActionsPayload;

const blockPromptSkeleton: BlockPromptSkeleton = {
	type: "modal",
	title: INIT_MODAL_NAME,
	action_id: INIT_ACTION_ID,
	submit: "Submit",
	blocks: [],
  };
  
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
	else if (body.event?.type === "app_home_opened") {
		console.log("APP HOME OPENED", body)
		await publishHomeTab(body.event.user, actionsBlocks, "Barbell cURL");
	}
	else if (body.payload) {
		console.log("Body", body)
		const payload: SlackPayload = JSON.parse(body.payload);
		console.log("Slash Command Payload", payload)
		switch(payload.type) {
			case "shortcut":
				const blockPromptConstructor = new BlockPromptConstructor(blockPromptSkeleton, Object.values(bot.getActions()));
				const modal = blockPromptConstructor.getPromptModal(payload.trigger_id);
				await openModal(payload.trigger_id, modal.blocks, INIT_MODAL_NAME)
				break;

			case "block_actions": 
				console.log("Block actions payload ", payload);
				const blockActionsPayload = payload as BlockActionsPayload
				const actionInput = blockActionsPayload.actions[0]
				
				if (actionInput.action_id !== INIT_ACTION_ID) {
					if(blockActionsPayload.view.state) { 

						const promptConstructor = new BlockModalConstructor(blockActionsPayload, blockActionsPayload.view.title.text);
						const promptFolowup = await promptConstructor.getExistingModal();
						await updateModal(blockActionsPayload.view.id, promptFolowup.blocks, promptFolowup.title.text, promptFolowup.submit.text);
			


						const buttonClick = blockActionsPayload.actions.filter(action => action.type === "button").map(action => ({
							action: action.action_id,
							value: action.value
						}))?.[0];



						const { state } = blockActionsPayload.view
						const inputs = Array.from(Object.values(state.values))
						const actionName = (blockActionsPayload.view.type === 'modal') ? blockActionsPayload.view.title.text : (blockActionsPayload.view.blocks[0] as HeaderBlock).text.text
						console.log("GOT INPUTS", actionName, inputs);
						const action = bot.getAction(actionName);


						if(action === undefined) throw new Error("Action not found");
						const flattenedInputs = inputs.reduce((acc, input) => {
							const key = Object.keys(input)[0];
							acc[key] = input[key];
							return acc;
						}, {});
					}
				}	
				else {
					const intendedAction = getActionValue(actionInput)
					const action = bot.getAction(intendedAction)
					const blocks = await action.run()
					if (blockActionsPayload.view.type === 'modal') {
						await updateModal(blockActionsPayload.view.id, blocks, action.name, "Submit")
					}
					else {
						await publishHomeTab(blockActionsPayload.user.id, blocks, action.name)
					}
					return
				}
		 }



		//  if (payload.type === "block_actions") {
		// 	const blockActionsPayload = payload as BlockActionsPayload
		// 	console.log("Block Actions Payload", blockActionsPayload)
		// 	const actionInput = blockActionsPayload.actions[0]
		// 	if (actionInput.action_id !== INIT_ACTION_ID) {
		// 		if (blockActionsPayload.view.state) {
		// 			const { state } = blockActionsPayload.view
		// 			const inputs = Array.from(Object.values(state.values))
		// 			const actionName = (blockActionsPayload.view.type === 'modal') ? blockActionsPayload.view.title.text : (blockActionsPayload.view.blocks[0] as HeaderBlock).text.text
		// 			console.log("GOT INPUTS", actionName, inputs)
		// 			const action = bot.getAction(actionName)
		// 			if (action === undefined) throw new Error("Action not found")
		// 			// inputs is a list of {key: object} -> flatten this into one object
		// 			const flattenedInputs = inputs.reduce((acc, input) => {
		// 				const key = Object.keys(input)[0];
		// 				acc[key] = input[key];
		// 				return acc;
		// 			}, {});
		// 			console.log("FLATTENED INPUTS", flattenedInputs);
		// 			const buttonClick = blockActionsPayload.actions.filter(action => action.type === "button").map(action => ({
		// 				action: action.action_id,
		// 				value: action.value
		// 			}))?.[0];
		// 			console.log("BUTTON CLICK", buttonClick)
		// 			const blocks = await action.run(flattenedInputs, buttonClick)
		// 			console.log("RENDERING BLOCKS", blocks)
		// 			if (blockActionsPayload.view.type === 'modal') {
		// 				await updateModal(blockActionsPayload.view.id, blocks, action.name, "Submit")
		// 			}
		// 			else {
		// 				await publishHomeTab(blockActionsPayload.user.id, blocks, action.name)
		// 			}
		// 		}
		// 		return
		// 	}
		// }
		// else console.log("No payload tag", JSON.parse(body.payload))
	}
	else {
		console.log("Unhandled event", body)
	}
})
app.listen(3000);


console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
