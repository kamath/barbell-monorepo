// src/sdk.ts

import { App, ExpressReceiver, BlockAction, SlackActionMiddlewareArgs, ActionConstraints, BlockElementAction, Middleware,  } from '@slack/bolt';
import { StringIndexed } from '@slack/bolt/dist/types/helpers';
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
    console.log("Payload: ", payload)
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
    console.log("Block Action Payload: ", payload)
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
    });

    this.app.message(async ({ message, say }) => {
      const text = (message as any).text;
      console.log(text)
      const action = this.actions.find(a => a.name.toLowerCase() === text.toLowerCase());
      console.log(action)
      if (action) {
        //await say('Message Received');
        await action.execute(message);
      }
    });

    this.app.action<BlockAction>({ action_id: /.*/ }, async ({ action, ack, body, say }) => {
      await ack();
      const blockAction = this.blockActions.find(a => a.actionId === action.action_id);
      console.log(blockAction)
      if (blockAction) {
        //await say('Block Action Received');
        await blockAction.execute(action);
      }
    });

    this.app.start(port).then(() => {
      console.log('⚡️ Slack bot is running!');
    });
  }

  public action(actionConstraints: ActionConstraints<BlockAction<BlockElementAction>>, handler: Middleware<SlackActionMiddlewareArgs<BlockAction<BlockElementAction>>, StringIndexed>) {
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

  private async processBlockActions(channel: string, thread_ts: string, actions: BlockActionOptions[]) {
    for (const action of actions) {
      const response = await this.sendBlockAction(channel, thread_ts, action);
      if (response && typeof response.thread_ts === 'string') {
        thread_ts = response.thread_ts || thread_ts; 
      }
    }
  }

  private async sendBlockAction(channel: string, thread_ts: string, action: BlockActionOptions) {
    try { 

        const response = await this.app.client.chat.postMessage({
            channel,
            thread_ts,
            blocks: [
                {
                    type: "divider"
                }
            ]
        })
        return response;
    } catch (error) {
        console.error("Errorz: ", error);
        return null;
    }
  }
}

export { SlackBot, Action, BlockActionHandler };
