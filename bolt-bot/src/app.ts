import { AWS_REGION, AWS_SECRET_NAME } from './consts';
import WebClient from './node_modules/@slack/web-api/dist/WebClient';
import { SlackBot, Action, BlockActionHandler } from './sdk';
import { getSecret } from './utils/aws';

const BotSecrets: {
	SLACK_EVENT_SIGNING_SECRET: string;
	SLACK_TOKEN: string;
	PORT: number;
} = JSON.parse(await getSecret(AWS_SECRET_NAME, AWS_REGION) || "{}");

const bot = new SlackBot(BotSecrets.SLACK_EVENT_SIGNING_SECRET || "", BotSecrets.SLACK_TOKEN || "", Number(BotSecrets.PORT) || 3000);
const slackClient = new WebClient(BotSecrets.SLACK_TOKEN || "");

export { bot, Action, BlockActionHandler, slackClient };
