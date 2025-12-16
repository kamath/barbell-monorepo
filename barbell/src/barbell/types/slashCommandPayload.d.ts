export type ShortcutPayload = {
	type: "shortcut";
	token: string;
	action_ts: string;
	team: {
		id: string;
		domain: string;
	};
	user: {
		id: string;
		username: string;
		team_id: string;
	};
	is_enterprise_install: boolean;
	enterprise: any | null;
	callback_id: string;
	trigger_id: string;
};
