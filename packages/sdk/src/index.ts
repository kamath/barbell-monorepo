// Context types

// Slack types (all exported from blocks.ts)
export type {
	ActionsBlock,
	ActionsBlockElement,
	AnyBlock,
	// Blocks
	Block,
	// Block Elements
	Button,
	ButtonElement,
	ChannelsSelect,
	Checkboxes,
	ColorScheme,
	Confirm,
	ConfirmationDialog,
	ConfirmDialog,
	ContextActionsBlock,
	ContextBlock,
	ConversationsSelect,
	ConversationType,
	Datepicker,
	DateTimepicker,
	DispatchActionConfig,
	DividerBlock,
	EmailInput,
	EntityMetadata,
	ExternalSelect,
	FeedbackButtons,
	FileBlock,
	FileInput,
	HeaderBlock,
	HomeView,
	IconButton,
	ImageBlock,
	ImageElement,
	InputBlock,
	KnownBlock,
	LinkUnfurls,
	MarkdownBlock,
	// Message Attachments
	MessageAttachment,
	// Message Metadata
	MessageMetadata,
	ModalView,
	MrkdwnElement,
	MrkdwnOption,
	MultiChannelsSelect,
	MultiConversationsSelect,
	MultiExternalSelect,
	MultiSelect,
	MultiStaticSelect,
	MultiUsersSelect,
	NumberInput,
	Option,
	OptionGroup,
	Overflow,
	// Composition Objects
	PlainTextElement,
	PlainTextInput,
	PlainTextOption,
	RadioButtons,
	RawTextElement,
	RichTextBlock,
	RichTextInput,
	RichTextList,
	RichTextPreformatted,
	RichTextQuote,
	RichTextSection,
	SectionBlock,
	Select,
	SlackFileImageObject,
	StaticSelect,
	TableBlock,
	TextObject,
	Timepicker,
	URLInput,
	UrlImageObject,
	UsersSelect,
	VideoBlock,
	// Views
	View,
	WorkflowButton,
	WorkflowStepView,
} from "./blocks";
export type {
	BarbellContext,
	BlockAction,
	BlockActionContext,
	EventContext,
	MessageContext,
	ThreadMessage,
	ViewStateValue,
	ViewSubmissionContext,
} from "./context";

import type { KnownBlock, View } from "./blocks";
// Main function type
import type { BarbellContext, MessageContext } from "./context";

/**
 * The type signature for the customer's main function.
 */
export type MainFunction = (
	context: BarbellContext,
) => Promise<KnownBlock[] | View>;

/**
 * Configuration object that customers export from their worker.
 * Contains tools and an optional function to choose which tool to use.
 */
export type BarbellConfig<
	T extends Record<string, { inputSchema: unknown }> = Record<
		string,
		{ inputSchema: unknown }
	>,
> = {
	tools: T;
	chooseTool?: (ctx: MessageContext) => Promise<keyof T>;
};

// Schema utilities
export { jsonSchemaToInputBlocks } from "./schema";
export type { JsonSchemaToInputBlocksOptions } from "./schema";
