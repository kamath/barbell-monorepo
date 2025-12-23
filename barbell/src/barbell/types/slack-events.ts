// Types for Slack Events API payloads
// These complement the types from @slack/web-api

export interface SlackEventBase {
	type: string;
	event_ts?: string;
	ts?: string;
}

export interface AppMentionEvent extends SlackEventBase {
	type: "app_mention";
	user: string;
	text: string;
	ts: string;
	channel: string;
	channel_type?: string;
	thread_ts?: string;
}

export interface AppHomeOpenedEvent extends SlackEventBase {
	type: "app_home_opened";
	user: string;
	channel: string;
	tab?: string;
	view?: unknown;
}

export interface SlashCommandEvent extends SlackEventBase {
	type: "slash_command";
	command: string;
	text?: string;
	response_url?: string;
	trigger_id?: string;
	user_id?: string;
	user_name?: string;
	team_id?: string;
	channel_id?: string;
	channel_name?: string;
}

export type SlackEvent =
	| AppMentionEvent
	| AppHomeOpenedEvent
	| SlashCommandEvent;

export interface SlackEventCallback {
	token?: string;
	team_id?: string;
	api_app_id?: string;
	event: SlackEvent;
	type: "event_callback";
	event_id?: string;
	event_time?: number;
	authed_users?: string[];
	authorizations?: Array<{
		enterprise_id?: string;
		team_id?: string;
		user_id?: string;
		is_bot: boolean;
		is_enterprise_install?: boolean;
	}>;
	is_ext_shared_channel?: boolean;
	event_context?: string;
}

export interface SlackChallenge {
	token?: string;
	challenge: string;
	type: "url_verification";
}

export interface SlackInteractivePayload {
	type: "block_actions";
	team?: {
		id: string;
		domain: string;
	};
	user?: {
		id: string;
		name: string;
		username?: string;
		team_id?: string;
	};
	api_app_id?: string;
	token?: string;
	container?: unknown;
	trigger_id?: string;
	response_url?: string;
	actions?: Array<{
		action_id?: string;
		block_id?: string;
		text?: {
			type: string;
			text: string;
			emoji?: boolean;
		};
		value?: string;
		type: string;
		action_ts?: string;
		selected_option?: {
			text: {
				type: string;
				text: string;
				emoji?: boolean;
			};
			value: string;
		};
	}>;
}

export type SlackWebhookPayload =
	| SlackChallenge
	| SlackEventCallback
	| SlackInteractivePayload;
