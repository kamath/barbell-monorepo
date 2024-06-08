// slackAPI.ts
import { WebClient } from '@slack/web-api';
import { Block, KnownBlock } from '@slack/types';
import { Logger } from './Logger';

const token = process.env.SLACK_BOT_TOKEN || "";
const slackClient = new WebClient(token);

export async function sendSlackMessage(channel: string, blocks: (Block | KnownBlock)[]): Promise<void> {
  try {
    await slackClient.chat.postMessage({
      channel,
      blocks,
      text: 'Action required',
    });
    Logger.info(`Message sent to Slack channel: ${channel}`);
  } catch (error) {
    Logger.error(`Error sending message to Slack: ${error}`);
  }
}