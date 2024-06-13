// blockPromptConstructor.ts
import { Block, Option, KnownBlock } from "@slack/web-api";
import { Action } from "../barbell/bot";
import { BlockActionsPayload } from "../types/slackEvent";

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
    const actionOptions: Option[] = this.actions.map((action) => ({
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
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Pick an item from the dropdown list",
        },
        accessory: {
          type: "static_select",
          placeholder: {
            type: "plain_text",
            text: "Select an item",
            emoji: true,
          },
          options: actionOptions,
          action_id: this.skeleton.action_id,
        },
      } as KnownBlock, // Validates type compatibility
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

class BlockModalConstructor {
  private blockActionsPayload: BlockActionsPayload;
  private action!: Action;

  constructor(blockActionsPayload: BlockActionsPayload, action: Action) {
    this.blockActionsPayload = blockActionsPayload;
    this.action = action;
  }

  flattenInputs() {
    const { state } = this.blockActionsPayload.view;
    const inputs = Array.from(Object.values(state.values));
    return inputs.reduce((acc, input) => {
      const key = Object.keys(input)[0];
      acc[key] = input[key];
      return acc;
    }, {});
  }

  async getExistingModal() {
    console.log("GETTING EXISTING MODAL");
    let snthing = await this.action.run(this.flattenInputs());
    console.log("SNTHING", snthing);
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
      blocks: [...(await this.action.run(this.flattenInputs()))],
    };
  }

  async getNewModal() {
    console.log("GETTING NEW MODAL");
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
      blocks: [...(await this.action.run())],
    };
  }
}

export { BlockPromptConstructor, BlockPromptSkeleton, Action, BlockModalConstructor };
