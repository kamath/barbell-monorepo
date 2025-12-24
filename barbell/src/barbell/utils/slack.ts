import {
	type Block,
	type ChatPostMessageArguments,
	type ConversationsRepliesArguments,
	type ConversationsRepliesResponse,
	type KnownBlock,
	LogLevel,
	type View,
	WebClient,
} from "@slack/web-api";
import { getSlackSecrets } from "../consts";

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
export const getSlackClient = (env: Env): WebClient => {
	const secrets = getSlackSecrets(env);
	if (!secrets.SLACK_OAUTH_TOKEN) {
		throw new Error("SLACK_OAUTH_TOKEN is not set in environment variables");
	}
	return new WebClient(secrets.SLACK_OAUTH_TOKEN, {
		// LogLevel can be imported and used to make debugging simpler
		logLevel: LogLevel.DEBUG,
	});
};

export const openModal = async (
	client: WebClient,
	trigger_id: string,
	blocks: Block[],
	title: string,
	submit?: string,
) => {
	await client.views.open({
		trigger_id,
		view: {
			type: "modal",
			title: {
				type: "plain_text",
				text: title,
			},
			submit: {
				type: "plain_text",
				text: submit || "Submit",
			},
			blocks,
		},
	});
};

export const updateModal = async (
	client: WebClient,
	viewId: string,
	blocks: Block[],
	title: string,
	submit?: string,
) => {
	await client.views.update({
		view_id: viewId,
		view: {
			type: "modal",
			title: {
				type: "plain_text",
				text: title,
			},
			submit: {
				type: "plain_text",
				text: submit || "Submit",
			},
			blocks,
		},
	});
};

export const openView = async (
	client: WebClient,
	trigger_id: string,
	view: View,
) => {
	await client.views.open({
		trigger_id,
		view,
	});
};

// Types for interactive action elements
interface StaticSelectAction {
	type: "static_select";
	selected_option: {
		value: string;
	};
}

interface PlainTextInputAction {
	type: "plain_text_input";
	value: string;
}

type SupportedAction = StaticSelectAction | PlainTextInputAction;

export const getActionValue = (action: SupportedAction): string => {
	if (action.type === "static_select") {
		return action.selected_option.value;
	}
	if (action.type === "plain_text_input") {
		return action.value;
	}
	// TypeScript exhaustiveness check
	const _exhaustive: never = action;
	throw new Error(
		`Unsupported action type: ${(_exhaustive as SupportedAction).type}`,
	);
};

export const publishHomeTab = async (
	client: WebClient,
	user_id: string,
	blocks: Block[],
	title: string,
) => {
	await client.views.publish({
		user_id,
		view: {
			type: "home",
			blocks: [
				{
					type: "header",
					text: {
						type: "plain_text",
						text: title,
					},
				},
				...blocks,
				{
					type: "divider",
				},
			],
		},
	});
	console.log("Published home tab", blocks);
	return { status: 200 };
};

export const sendMessage = async (
	client: WebClient,
	blocks: (Block | KnownBlock)[],
	channel: string,
	thread_ts?: string,
	reply_broadcast: boolean = true,
) => {
	// Build arguments based on whether we're replying in a thread
	// ChatPostMessageArguments uses a discriminated union for ReplyInThread
	const baseArgs = {
		channel: channel,
		blocks: blocks,
	};

	let args: ChatPostMessageArguments;
	if (thread_ts) {
		if (reply_broadcast) {
			// BroadcastedThreadReply: thread_ts required, reply_broadcast must be exactly true
			args = {
				...baseArgs,
				thread_ts: thread_ts,
				reply_broadcast: true as const,
			};
		} else {
			// WithinThreadReply: thread_ts optional, reply_broadcast false or omitted
			args = {
				...baseArgs,
				thread_ts: thread_ts,
				reply_broadcast: false as const,
			};
		}
	} else {
		args = baseArgs;
	}

	await client.chat.postMessage(args);
};

export const readChannelMembers = async (
	client: WebClient,
	channel: string,
) => {
	const members = await client.conversations.members({ channel });
	return members.members;
};

export const getThreadReplies = async (
	client: WebClient,
	channel: string,
	thread_ts: string,
): Promise<ConversationsRepliesResponse["messages"]> => {
	const args: ConversationsRepliesArguments = {
		channel,
		ts: thread_ts,
	};
	const result = await client.conversations.replies(args);
	return result.messages || [];
};
