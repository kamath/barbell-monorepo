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
} from "./context";

import type { KnownBlock, View } from "./blocks";
// Main function type
import type { BarbellContext } from "./context";

/**
 * The type signature for the customer's main function.
 */
export type MainFunction = (
	context: BarbellContext,
) => Promise<KnownBlock[] | View>;
