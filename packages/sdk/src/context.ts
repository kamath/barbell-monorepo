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
}

/**
 * The context object passed to the customer's main function.
 */
export interface BarbellContext {
	/** Thread messages (if the event occurred in a thread) */
	threadMessages: ThreadMessage[] | undefined;
	/** Event metadata */
	event: EventContext;
	/** Reserved for future extensibility */
	metadata?: Record<string, unknown>;
}
