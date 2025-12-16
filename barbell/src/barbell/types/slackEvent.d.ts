import { Action, Block } from "@slack/web-api";

export type BlockActionsPayload = {
	type: "block_actions";
	user: {
		id: string;
		username: string;
		name: string;
		team_id: string;
	};
	api_app_id: string;
	token: string;
	container: {
		type: string;
		view_id: string;
	};
	trigger_id: string;
	team: {
		id: string;
		domain: string;
	};
	enterprise: any | null;
	is_enterprise_install: boolean;
	view: {
		id: string;
		team_id: string;
		type: string;
		blocks: Block[];
		private_metadata: string;
		callback_id: string;
		state: {
			values: {
				[key: string]: {
					[key: string]: {
						type: string;
						value: string;
					};
				};
			};
		};
		hash: string;
		title: {
			type: string;
			text: string;
			emoji: boolean;
		};
		clear_on_close: boolean;
		notify_on_close: boolean;
		close: any | null;
		submit: any | null;
		previous_view_id: string | null;
		root_view_id: string;
		app_id: string;
		external_id: string;
		app_installed_team_id: string | null;
		bot_id: string;
	};
	actions: {
		type: string;
		block_id: string;
		action_id: string;
		value: string;
		action_ts: string;
	}[];
};
