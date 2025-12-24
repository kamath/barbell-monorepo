/**
 * Simplified thread message type for customers.
 * Based on Slack's ConversationsRepliesResponse["messages"] but without
 * exposing the full @slack/web-api dependency.
 */
export interface ThreadMessage {
	user?: string;
	text?: string;
	ts?: string;
	thread_ts?: string;
	type?: string;
	bot_id?: string;
	app_id?: string;
}

/**
 * Event metadata passed to the customer's main function.
 */
export interface EventContext {
	/** The channel where the event occurred */
	channel: string;
	/** The user who triggered the event */
	user: string;
	/** The text content of the message */
	text: string;
	/** Timestamp of the message */
	ts: string;
	/** Thread timestamp (if in a thread) */
	thread_ts?: string;
	/** Trigger ID for opening modals (available for interactive actions) */
	trigger_id?: string;
}

/**
 * Represents an action triggered by a user interacting with a block element.
 * This is sent when users click buttons, select options, etc.
 * Matches the structure of action objects in Slack's block_actions payload.
 */
export interface BlockAction {
	/** The action_id of the interactive element */
	action_id?: string;
	/** The block_id of the block containing the element */
	block_id?: string;
	/** The type of element that triggered the action (button, static_select, etc.) */
	type: string;
	/** The value associated with the action (for buttons) */
	value?: string;
	/** Timestamp when the action was triggered */
	action_ts?: string;
	/** Text content of the element (for buttons) */
	text?: {
		type: string;
		text: string;
		emoji?: boolean;
	};
	/** Selected option (for select menus) */
	selected_option?: {
		text: {
			type: string;
			text: string;
			emoji?: boolean;
		};
		value: string;
	};
}

type BaseContext = {
	event: EventContext;
	metadata?: Record<string, unknown>;
};

/**
 * The context object passed to the customer's main function.
 */
export type MessageContext = BaseContext & {
	threadMessages: ThreadMessage[];
};

export type BlockActionContext = BaseContext & {
	blockAction: BlockAction[];
};

export type BarbellContext = MessageContext | BlockActionContext;
