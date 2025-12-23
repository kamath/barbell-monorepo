import type {
	BarbellContext,
	BlockActionContext,
	KnownBlock,
	MessageContext,
} from "@barbell/sdk";

function handleBlockAction(context: BlockActionContext): KnownBlock[] {
	return [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: `Nice!\n\`\`\`${JSON.stringify(context.blockAction, null, 2)}\`\`\``,
			},
		},
	];
}

function handleMessageContext(context: MessageContext): KnownBlock[] {
	// Handle message context (thread messages)
	const { threadMessages, event } = context;

	// If there's no event context, return empty (shouldn't happen)
	if (!event) {
		return [];
	}

	// If there are no thread messages, show a welcome message
	if (!threadMessages || threadMessages.length === 0) {
		return [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: `Hello <@${event.user}>! You mentioned me but there's no thread context dummy.`,
				},
			},
			{
				type: "divider",
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Farmhouse",
							emoji: true,
						},
						value: "click_me_123",
					},
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Kin Khao",
							emoji: true,
						},
						value: "click_me_123",
						url: "https://google.com",
					},
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Ler Ros",
							emoji: true,
						},
						value: "click_me_123",
						url: "https://google.com",
					},
				],
			},
			{
				type: "actions",
				elements: [
					{
						type: "conversations_select",
						placeholder: {
							type: "plain_text",
							text: "Select a conversation",
							emoji: true,
						},
						action_id: "actionId-0",
					},
					{
						type: "channels_select",
						placeholder: {
							type: "plain_text",
							text: "Select a channel",
							emoji: true,
						},
						action_id: "actionId-1",
					},
					{
						type: "users_select",
						placeholder: {
							type: "plain_text",
							text: "Select a user",
							emoji: true,
						},
						action_id: "actionId-2",
					},
					{
						type: "static_select",
						placeholder: {
							type: "plain_text",
							text: "Select an item",
							emoji: true,
						},
						options: [
							{
								text: {
									type: "plain_text",
									text: "*plain_text option 0*",
									emoji: true,
								},
								value: "value-0",
							},
							{
								text: {
									type: "plain_text",
									text: "*plain_text option 1*",
									emoji: true,
								},
								value: "value-1",
							},
							{
								text: {
									type: "plain_text",
									text: "*plain_text option 2*",
									emoji: true,
								},
								value: "value-2",
							},
						],
						action_id: "actionId-3",
					},
				],
			},
			{
				type: "actions",
				elements: [
					{
						type: "conversations_select",
						placeholder: {
							type: "plain_text",
							text: "Select private conversation",
							emoji: true,
						},
						filter: {
							include: ["private"],
						},
						action_id: "actionId-0",
					},
				],
			},
			{
				type: "actions",
				elements: [
					{
						type: "conversations_select",
						placeholder: {
							type: "plain_text",
							text: "Select a conversation",
							emoji: true,
						},
						initial_conversation: "G12345678",
						action_id: "actionId-0",
					},
					{
						type: "users_select",
						placeholder: {
							type: "plain_text",
							text: "Select a user",
							emoji: true,
						},
						initial_user: "U12345678",
						action_id: "actionId-1",
					},
					{
						type: "channels_select",
						placeholder: {
							type: "plain_text",
							text: "Select a channel",
							emoji: true,
						},
						initial_channel: "C12345678",
						action_id: "actionId-2",
					},
				],
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Click Me",
							emoji: true,
						},
						value: "click_me_123",
						action_id: "actionId-0",
					},
				],
			},
			{
				type: "actions",
				elements: [
					{
						type: "datepicker",
						initial_date: "1990-04-28",
						placeholder: {
							type: "plain_text",
							text: "Select a date",
							emoji: true,
						},
						action_id: "actionId-0",
					},
					{
						type: "datepicker",
						initial_date: "1990-04-28",
						placeholder: {
							type: "plain_text",
							text: "Select a date",
							emoji: true,
						},
						action_id: "actionId-1",
					},
				],
			},
			{
				type: "actions",
				elements: [
					{
						type: "checkboxes",
						options: [
							{
								text: {
									type: "plain_text",
									text: "*this is plain_text text*",
									emoji: true,
								},
								description: {
									type: "plain_text",
									text: "*this is plain_text text*",
									emoji: true,
								},
								value: "value-0",
							},
							{
								text: {
									type: "plain_text",
									text: "*this is plain_text text*",
									emoji: true,
								},
								description: {
									type: "plain_text",
									text: "*this is plain_text text*",
									emoji: true,
								},
								value: "value-1",
							},
							{
								text: {
									type: "plain_text",
									text: "*this is plain_text text*",
									emoji: true,
								},
								description: {
									type: "plain_text",
									text: "*this is plain_text text*",
									emoji: true,
								},
								value: "value-2",
							},
						],
						action_id: "actionId-0",
					},
					{
						type: "checkboxes",
						options: [
							{
								text: {
									type: "mrkdwn",
									text: "*this is mrkdwn text*",
								},
								description: {
									type: "plain_text",
									text: "*this is mrkdwn text*",
								},
								value: "value-0",
							},
							{
								text: {
									type: "mrkdwn",
									text: "*this is mrkdwn text*",
								},
								description: {
									type: "plain_text",
									text: "*this is mrkdwn text*",
								},
								value: "value-1",
							},
							{
								text: {
									type: "mrkdwn",
									text: "*this is mrkdwn text*",
								},
								description: {
									type: "plain_text",
									text: "*this is mrkdwn text*",
								},
								value: "value-2",
							},
						],
						action_id: "actionId-1",
					},
				],
			},
			{
				type: "actions",
				elements: [
					{
						type: "radio_buttons",
						options: [
							{
								text: {
									type: "plain_text",
									text: "*plain_text option 0*",
									emoji: true,
								},
								value: "value-0",
							},
							{
								text: {
									type: "plain_text",
									text: "*plain_text option 1*",
									emoji: true,
								},
								value: "value-1",
							},
							{
								text: {
									type: "plain_text",
									text: "*plain_text option 2*",
									emoji: true,
								},
								value: "value-2",
							},
						],
						action_id: "actionId-0",
					},
				],
			},
			{
				type: "actions",
				elements: [
					{
						type: "timepicker",
						initial_time: "13:37",
						placeholder: {
							type: "plain_text",
							text: "Select time",
							emoji: true,
						},
						action_id: "actionId-0",
					},
					{
						type: "button",
						text: {
							type: "plain_text",
							text: "Click Me",
							emoji: true,
						},
						value: "click_me_123",
						action_id: "actionId-1",
					},
				],
			},
			{
				dispatch_action: true,
				type: "input",
				element: {
					type: "plain_text_input",
					action_id: "plain_text_input-action",
				},
				label: {
					type: "plain_text",
					text: "Label",
					emoji: true,
				},
				optional: false,
			},
			{
				dispatch_action: true,
				type: "input",
				element: {
					type: "plain_text_input",
					dispatch_action_config: {
						trigger_actions_on: ["on_character_entered"],
					},
					action_id: "plain_text_input-action",
				},
				label: {
					type: "plain_text",
					text: "Label",
					emoji: true,
				},
				optional: false,
			},
		];
	}

	// Show thread messages as blocks
	return [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: `Thread has ${threadMessages.length} messages`,
			},
		},
		{
			type: "divider",
		},
		...threadMessages.map((msg) => ({
			type: "section" as const,
			text: {
				type: "mrkdwn" as const,
				text: `*<@${msg.user}>*: ${msg.text}`,
			},
		})),
	];
}

/**
 * This is your main function. It receives context about the Slack event
 * and should return an array of Slack Block Kit blocks.
 */
export default async function main(
	context: BarbellContext,
): Promise<KnownBlock[]> {
	// Handle block actions (button clicks, etc.)
	if ("blockAction" in context) {
		return handleBlockAction(context);
	}

	return handleMessageContext(context);
}
