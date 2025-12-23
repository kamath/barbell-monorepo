/**
 * Re-export Slack types from @slack/types.
 * This provides direct access to Slack's official type definitions
 * without requiring customers to install @slack/types themselves.
 */

import type { Button, ConfirmationDialog } from "@slack/types";

// Block Kit - Blocks
export type {
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
} from "@slack/types";

// Block Kit - Block Elements
export type {
	Button,
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
} from "@slack/types";

// Block Kit - Composition Objects
export type {
	PlainTextElement,
	MrkdwnElement,
	TextObject,
	RawTextElement,
	ConfirmationDialog,
	Confirm,
	DispatchActionConfig,
	Option,
	MrkdwnOption,
	PlainTextOption,
	OptionGroup,
	SlackFileImageObject,
	UrlImageObject,
	ColorScheme,
	ConversationType,
} from "@slack/types";

// Views (Modals, Home Tabs, etc.)
export type {
	View,
	HomeView,
	ModalView,
	WorkflowStepView,
} from "@slack/types";

// Message Attachments
export type {
	MessageAttachment,
	LinkUnfurls,
} from "@slack/types";

// Message Metadata
export type {
	MessageMetadata,
	EntityMetadata,
} from "@slack/types";

// Backward compatibility aliases
export type ButtonElement = Button;
export type ConfirmDialog = ConfirmationDialog;
