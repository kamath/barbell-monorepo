import { SlackBot, Action, BlockActionHandler } from './sdk';

const bot = new SlackBot(process.env.SLACK_EVENT_SIGNING_SECRET || "", process.env.SLACK_TOKEN || "", Number(process.env.PORT) || 3000);

export { bot, Action, BlockActionHandler };
