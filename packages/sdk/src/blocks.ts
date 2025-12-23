/**
 * Simplified Slack Block Kit types for customer use.
 * These mirror Slack's Block Kit but are self-contained to avoid
 * exposing @slack/web-api as a dependency.
 */

// Text elements
export interface PlainTextElement {
	type: "plain_text";
	text: string;
	emoji?: boolean;
}

export interface MrkdwnElement {
	type: "mrkdwn";
	text: string;
	verbatim?: boolean;
}

export type TextObject = PlainTextElement | MrkdwnElement;

// Interactive elements
export interface ButtonElement {
	type: "button";
	text: PlainTextElement;
	action_id?: string;
	url?: string;
	value?: string;
	style?: "primary" | "danger";
	confirm?: ConfirmDialog;
}

export interface ImageElement {
	type: "image";
	image_url: string;
	alt_text: string;
}

export interface ConfirmDialog {
	title: PlainTextElement;
	text: TextObject;
	confirm: PlainTextElement;
	deny: PlainTextElement;
	style?: "primary" | "danger";
}

// Block types
export interface SectionBlock {
	type: "section";
	text?: TextObject;
	block_id?: string;
	fields?: TextObject[];
	accessory?: ImageElement | ButtonElement;
}

export interface DividerBlock {
	type: "divider";
	block_id?: string;
}

export interface ImageBlock {
	type: "image";
	image_url: string;
	alt_text: string;
	title?: PlainTextElement;
	block_id?: string;
}

export interface ActionsBlock {
	type: "actions";
	elements: ButtonElement[];
	block_id?: string;
}

export interface HeaderBlock {
	type: "header";
	text: PlainTextElement;
	block_id?: string;
}

export interface ContextBlock {
	type: "context";
	elements: (TextObject | ImageElement)[];
	block_id?: string;
}

/**
 * Union of all supported block types.
 */
export type Block =
	| SectionBlock
	| DividerBlock
	| ImageBlock
	| ActionsBlock
	| HeaderBlock
	| ContextBlock;
