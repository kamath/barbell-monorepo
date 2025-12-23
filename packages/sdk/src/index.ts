// Context types
export type {
	BarbellContext,
	BlockActionContext,
	MessageContext,
	EventContext,
	ThreadMessage,
	BlockAction,
} from "./context";

// Slack types (all exported from blocks.ts)
export type {
	// Blocks
	Block,
	KnownBlock,
	AnyBlock,
	ActionsBlock,
	ContextBlock,
	ContextActionsBlock,
	DividerBlock,
	FileBlock,
	HeaderBlock,
	ImageBlock,
	InputBlock,
	MarkdownBlock,
	RichTextBlock,
	SectionBlock,
	TableBlock,
	VideoBlock,
	// Block Elements
	Button,
	ButtonElement,
	Checkboxes,
	Datepicker,
	DateTimepicker,
	EmailInput,
	FeedbackButtons,
	FileInput,
	IconButton,
	ImageElement,
	MultiSelect,
	NumberInput,
	Overflow,
	PlainTextInput,
	RadioButtons,
	RichTextInput,
	RichTextList,
	RichTextPreformatted,
	RichTextQuote,
	RichTextSection,
	Select,
	StaticSelect,
	ExternalSelect,
	UsersSelect,
	ConversationsSelect,
	ChannelsSelect,
	MultiStaticSelect,
	MultiExternalSelect,
	MultiUsersSelect,
	MultiConversationsSelect,
	MultiChannelsSelect,
	Timepicker,
	URLInput,
	WorkflowButton,
	ActionsBlockElement,
	// Composition Objects
	PlainTextElement,
	MrkdwnElement,
	TextObject,
	RawTextElement,
	ConfirmationDialog,
	Confirm,
	ConfirmDialog,
	DispatchActionConfig,
	Option,
	MrkdwnOption,
	PlainTextOption,
	OptionGroup,
	SlackFileImageObject,
	UrlImageObject,
	ColorScheme,
	ConversationType,
	// Views
	View,
	HomeView,
	ModalView,
	WorkflowStepView,
	// Message Attachments
	MessageAttachment,
	LinkUnfurls,
	// Message Metadata
	MessageMetadata,
	EntityMetadata,
} from "./blocks";

// Main function type
import type { BarbellContext } from "./context";
import type { KnownBlock } from "./blocks";

/**
 * The type signature for the customer's main function.
 */
export type MainFunction = (context: BarbellContext) => Promise<KnownBlock[]>;
