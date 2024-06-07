import { WebClient, LogLevel, Block, KnownBlock, ChatPostMessageArguments } from "@slack/web-api";
import { open_garage_and_gate_blocks, open_garage_blocks, open_gate_blocks } from "./openGarage";

const SLACK_VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN || "";
const SEND_WEBHOOK_URL = process.env.SEND_WEBHOOK_URL || "";
const SLACK_OAUTH_TOKEN = process.env.SLACK_OAUTH_TOKEN || "";

export type SlackChallengeEventBody = {
	type: string;
	token: string;
	challenge: string;
	[propName: string]: any; // This allows for additional properties
}

export type SlackMentionEventBody = {
	type: string,
	event_id: string,
	event_time: number,
	token: string,
	team_id: string,
	api_app_id: string,
	event: {
		user: string,
		type: "app_mention",
		ts: string,
		client_msg_id: string,
		text: string,
		team: string,
		blocks: {
			type: string,
			block_id: string,
			elements: any[]
		}[],
		channel: string,
		event_ts: string,
		message?: any
	},
	authorizations: {
		enterprise_id: string | null,
		team_id: string,
		user_id: string,
		is_bot: boolean,
		is_enterprise_install: boolean
	}
};

export type SlackEventBody = SlackChallengeEventBody | SlackMentionEventBody;

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

export enum SlackIntent {
	SELECT__BOTH = "Select both gates",
	SELECT__MISSION_ST = "Select Mission Gate",
	SELECT__OTIS_GATE = "Select Otis Gate",
	DEFAULT = "Default"
}

export const SlackIntentToBlocks = {
	[SlackIntent.SELECT__BOTH]: open_garage_and_gate_blocks,
	[SlackIntent.SELECT__MISSION_ST]: open_garage_blocks,
	[SlackIntent.SELECT__OTIS_GATE]: open_gate_blocks,
}

export const generateBlocksFromIntent = async (event: SlackMentionEventBody) => {
	let blocks = SlackIntent.DEFAULT;
	if (event.event.text.includes('open')) {
		blocks = SlackIntent.SELECT__BOTH;
	}
	else if (event.event.text.includes('garage')) {
		blocks = SlackIntent.SELECT__MISSION_ST;
	}
	else if (event.event.text.includes('gate')) {
		blocks = SlackIntent.SELECT__OTIS_GATE;
	}
	else {
		blocks = SlackIntent.SELECT__BOTH;
	}
	return SlackIntentToBlocks[blocks]();
}

export const intentBlocks = [{
	"type": "section",
	"text": {
		"type": "mrkdwn",
		"text": "...or select a different intent from the list:"
	},
	"accessory": {
		"type": "static_select",
		"placeholder": {
			"type": "plain_text",
			"text": "Select an item",
			"emoji": true
		},
		// Loop through the SlackIntent enum and create a list of options
		"options": Object.entries(SlackIntent).filter(([key, value]) => value !== SlackIntent.DEFAULT).map(([key, value]) => ({
			"text": {
				"type": "plain_text",
				"text": value.replace(/_/g, ' '),
				"emoji": true
			},
			"value": key
		})),
		"action_id": "intent_select"
	}
}, {
	"type": "section",
	"text": {
		"type": "mrkdwn",
		"text": "Slack <@U075FJ5D1SM> if you enjoy using Barbell and would like to deploy internal tooling on Slack"
	}
}]

export const default_blocks = () => {
	return [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "It looks like we were unable to find a matched intent for your query. Please try again or select an intent below."
			}
		},
		...intentBlocks
	]
}