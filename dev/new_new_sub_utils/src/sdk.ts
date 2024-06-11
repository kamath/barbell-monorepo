// src/sdk.ts

import {
  App,
  ExpressReceiver,
  BlockAction,
  SlackActionMiddlewareArgs,
  ActionConstraints,
  BlockElementAction,
  Middleware,
} from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { getBlockValue } from "./types/blocks";
interface ActionOptions {
  name: string;
  handler: (payload: any) => Promise<void>;
}

interface BlockActionOptions {
  actionId: string;
  handler: (payload: any) => Promise<void>;
}

class Action {
  name: string;
  handler: (payload: any) => Promise<void>;

  constructor(options: ActionOptions) {
    this.name = options.name;
    this.handler = options.handler;
  }

  async execute(payload: any) {
    console.log("Payload: ", payload);

    await this.handler(payload);
  }
}

class BlockActionHandler {
  actionId: string;
  handler: (payload: any) => Promise<void>;

  constructor(options: BlockActionOptions) {
    this.actionId = options.actionId;
    this.handler = options.handler;
  }

  async execute(payload: any) {
    console.log("Block Action Payload: ", payload);
    await this.handler(payload);
  }
}

class SlackBot {
  public app: App;
  private actions: Action[] = [];
  private blockActions: BlockActionHandler[] = [];

  constructor(signingSecret: string, token: string, port: number) {
    this.app = new App({
      token,
      signingSecret,
      socketMode: false,
      port: port,      
    });

    this.app.event('', async ({ event, say }) => {
      console.log(event);
    });

    this.app.message(async ({ message, say }) => {
      try {
        const text = (message as any).text;
        console.log(text);
        if (typeof text === "string") {
          const action = this.actions.find((a) => a.name.toLowerCase() === text.toLowerCase());
          console.log(action);
          if (action) {
            await action.execute(message);
          }
        } else {
          console.log("Received message does not contain text or text is not a string.");
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    });

  this.app.action<BlockAction<BlockElementAction>>({ action_id: /.*/ }, async ({ action, ack, body, say }) => {
    await ack();
    try { 
      const value = this.getBlockActionValue(action);
      console.log("value_____________")
      console.log(value)
      console.log("blockAction.execute(action)_____________")
      console.log(body.container)
      await this.editMessage(
        body.container.channel_id,
        body.container.message_ts,
        "Selected: " + getBlockValue(action.type, action)
      )
        .then(() => {
          console.log("Message updated");
        })
        .catch((error) => {
          console.error("Error updating message: ", error);
        });

    } catch (error) {
      console.error("Error handling block action:", error);
    }
  })




    this.app.start(port).then(() => {
      console.log("⚡️ Slack bot is running!");
    });
  }

  public action(
    actionConstraints: ActionConstraints<BlockAction<BlockElementAction>>,
    handler: Middleware<SlackActionMiddlewareArgs<BlockAction<BlockElementAction>>, StringIndexed>
  ) {
    this.app.action(actionConstraints, handler);
  }

  public defineAction(options: ActionOptions) {
    this.actions.push(new Action(options));
  }

  public defineBlockAction(options: BlockActionOptions) {
    this.blockActions.push(new BlockActionHandler(options));
  }

  public addActionListener(actionId: string, handler: (payload: any) => Promise<void>) {
    this.app.action({ action_id: actionId }, async ({ action, ack, body, say }) => {
      await ack();
      await handler(action);
    });
  }

  public async editMessage(channel: string, ts: string, payload: string) {
    try {
      await this.app.client.chat.update({
        channel: channel,
        ts: ts,
        text: payload,
      });
    } catch (error) {
      console.error("Failed to update message:", error);
    }
  }

  private async processBlockActions(channel: string, thread_ts: string, actions: BlockActionOptions[]) {
    for (const action of actions) {
      const response = await this.sendBlockAction(channel, thread_ts, action);
      if (response && typeof response.thread_ts === "string") {
        thread_ts = response.thread_ts || thread_ts;
      }
    }
  }

  private getBlockActionValue(action: BlockElementAction): any {
    console.log("!_!_!_!_!__!_!_!_!_!_!_!_!_!_!_!_!");
    console.log(action)
    return action;
  }



  private async sendBlockAction(channel: string, thread_ts: string, action: BlockActionOptions) {
    try {
      const response = await this.app.client.chat.postMessage({
        channel,
        thread_ts,
        blocks: [
          {
            type: "divider",
          },
        ],
      });
      return response;
    } catch (error) {
      console.error("Errorz: ", error);
      return null;
    }
  }
}

export { SlackBot, Action, BlockActionHandler };
