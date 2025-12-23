// Context types
export type {
	BarbellContext,
	EventContext,
	ThreadMessage,
} from "./context";

// Block Kit types
export type {
	Block,
	SectionBlock,
	DividerBlock,
	ImageBlock,
	ActionsBlock,
	HeaderBlock,
	ContextBlock,
	PlainTextElement,
	MrkdwnElement,
	TextObject,
	ButtonElement,
	ImageElement,
	ConfirmDialog,
} from "./blocks";

// Main function type
import type { BarbellContext } from "./context";
import type { Block } from "./blocks";

/**
 * The type signature for the customer's main function.
 */
export type MainFunction = (context: BarbellContext) => Promise<Block[]>;
