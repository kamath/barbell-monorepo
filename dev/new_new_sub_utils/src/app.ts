import { SlackBot, Action, BlockActionHandler } from './sdk';

const bot = new SlackBot(process.env.SLACK_TOKEN!, process.env.SLACK_BOT_SECRET!, Number(process.env.PORT) || 3000);


export { bot, Action, BlockActionHandler };
