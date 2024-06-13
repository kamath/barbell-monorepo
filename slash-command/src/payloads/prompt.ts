// blockPromptConstructor.ts
import { Block, Option, KnownBlock} from "@slack/web-api";
import { Action } from "../barbell/bot";
import bot from "../actions";
import { BlockActionsPayload } from "../types/slackEvent";
import { ModalView } from "@slack/web-api";


interface BlockPromptSkeleton {
    type: string;
    title: string;
    action_id: string;
    submit: string;
    blocks: (Block | KnownBlock)[];
}

class BlockPromptConstructor {
    private skeleton: BlockPromptSkeleton;
    private actions: Action[];

    constructor(skeleton: BlockPromptSkeleton, actions: Action[]) {
        this.skeleton = skeleton;
        this.actions = actions;
    }

    generatePromptBlocks(): (Block | KnownBlock)[] {
        const actionOptions: Option[] = this.actions.map(action => ({
            text: {
                type: "plain_text",
                text: action.name,
                emoji: true,
            },
            value: action.name,
        }));
        console.log("rsdfsdf");
        console.log(actionOptions);


        return [
            ...this.skeleton.blocks,
            {
                "type": "section",
                "text": {
                    type: "mrkdwn",
                    "text": "Pick an item from the dropdown list",
                },
                "accessory": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select an item",
                        "emoji": true,
                    },
                    "options": actionOptions,
                    "action_id": this.skeleton.action_id,
                },
            } as KnownBlock, // Ensure type compatibility
        ];
    }

    getPromptModal(triggerId: string) {
        return {
            type: "modal",
            title: {
                type: "plain_text",
                text: this.skeleton.title,
            },
            submit: {
                type: "plain_text",
                text: this.skeleton.submit,
            },
            blocks: this.generatePromptBlocks(),
        };
    }
}

// takes in a block action payload
/*, we are implementing the following code in a MUCH CLEANER WAY: 
					const { state } = blockActionsPayload.view
					const inputs = Array.from(Object.values(state.values))
					const actionName = blockActionsPayload.view.title.text
					console.log("GOT INPUTS", actionName, inputs)
					const action = bot.getAction(actionName)
					// inputs is a list of {key: object} -> flatten this into one object
					const flattenedInputs = inputs.reduce((acc, input) => {
						const key = Object.keys(input)[0];
						acc[key] = input[key];
						return acc;
					}, {});
					console.log("FLATTENED INPUTS", flattenedInputs);
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
							...(await action.run(flattenedInputs))
						]
					})
				}

*/
class BlockModalConstructor { 
    private blockActionsPayload: BlockActionsPayload;
    private action: Action;

    constructor(blockActionsPayload: BlockActionsPayload) {
        this.blockActionsPayload = blockActionsPayload;
        this.action = bot.getAction(blockActionsPayload.view.title.text);
    }

    async flattenInputs() {
        const { state } = this.blockActionsPayload.view
        const inputs = Array.from(Object.values(state.values))
        return inputs.reduce((acc, input) => {
            const key = Object.keys(input)[0];
            acc[key] = input[key];
            return acc;
        }, {});
    }

    async getExistingModal() {
        return {
            type: "modal",
            title: {
                type: "plain_text",
                text: this.action.name,
            },
            submit: {
                type: "plain_text",
                text: "Submit",
            },
            blocks: [
                ...(await this.action.run(await this.flattenInputs()))
            ]
        }
    }

    async getNewModal() {
        return {
            type: "modal",
            title: {
                type: "plain_text",
                text: this.action.name,
            },
            submit: {
                type: "plain_text",
                text: "Submit",
            },
            blocks: [
                ...(await this.action.run())
            ]
        }
    }
}

export { BlockPromptConstructor, BlockPromptSkeleton, Action, BlockModalConstructor,  };

