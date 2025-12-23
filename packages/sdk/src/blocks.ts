/**
 * Re-export Slack types from @slack/types.
 * This provides direct access to Slack's official type definitions
 * without requiring customers to install @slack/types themselves.
 */

import type { Button, ConfirmationDialog } from "@slack/types";

// Block Kit - Blocks
// Block Kit - Block Elements
// Block Kit - Composition Objects
// Views (Modals, Home Tabs, etc.)
// Message Attachments
// Message Metadata
export type {
	ActionsBlock,
	ActionsBlockElement,
	AnyBlock,
	Block,
	Button,
	ChannelsSelect,
	Checkboxes,
	ColorScheme,
	Confirm,
	ConfirmationDialog,
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
	MessageAttachment,
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
	View,
	WorkflowButton,
	WorkflowStepView,
} from "@slack/types";

// Backward compatibility aliases
export type ButtonElement = Button;
export type ConfirmDialog = ConfirmationDialog;
