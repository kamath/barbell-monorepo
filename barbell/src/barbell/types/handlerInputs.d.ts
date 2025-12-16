import type { WebClient } from "@slack/web-api";

export type ChannelType = "channel" | "im" | "mpim" | "home" | "modal";

export type IO = {
	input: {
		text: (name: string) => Promise<string>;
		date: (name: string) => Promise<string>;
		time: (name: string) => Promise<string>;
		button: (
			name: string,
			onClick: () => Promise<void>,
			style?: "default" | "primary" | "danger",
		) => Promise<void>;
		multiSelect: (
			name: string,
			value: { name: string; value: string | number | boolean }[],
		) => Promise<(string | number | boolean)[]>;
		dropdown: (
			name: string,
			options: { name: string; value: string }[],
		) => Promise<{ name: string; value: string }>;
	};
	output: {
		markdown: (value: string) => Promise<MarkdownOutput>;
	};
};

export type HandlerInput = {
	io: IO;
	userId: string;
	// If it's a modal or home page, channelId is the same as channelType
	channelId: string;
	channelType: ChannelType;
	slackClient: WebClient;
};
