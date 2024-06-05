import { WebClient, LogLevel, Block, KnownBlock, ChatPostMessageArguments } from "@slack/web-api";

const SLACK_VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN || "";
const SEND_WEBHOOK_URL = process.env.SEND_WEBHOOK_URL || "";
const SLACK_OAUTH_TOKEN = process.env.SLACK_OAUTH_TOKEN || "";

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient(SLACK_OAUTH_TOKEN, {
	// LogLevel can be imported and used to make debugging simpler
	logLevel: LogLevel.DEBUG
});

export const verifyToken = (token: string) => {
	return token === SLACK_VERIFICATION_TOKEN;
}

export const sendMessage = async (blocks: (Block | KnownBlock)[], channel: string, thread_ts?: string, reply_broadcast: boolean = true) => {
	await client.chat.postMessage({
		channel: channel,
		blocks: blocks,
		...(thread_ts ? { thread_ts: thread_ts } : {}),
		...(reply_broadcast ? { reply_broadcast: true } : {})
	} as ChatPostMessageArguments);
};

