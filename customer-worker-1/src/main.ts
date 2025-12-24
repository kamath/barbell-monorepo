import type {
	BarbellContext,
	KnownBlock,
	View,
	ViewSubmissionContext,
} from "@barbell/sdk";

function renderModal(_context: BarbellContext): View {
	return {
		type: "modal",
		callback_id: "comprehensive_form",
		title: {
			type: "plain_text",
			text: "Project Details",
		},
		submit: {
			type: "plain_text",
			text: "Submit",
		},
		close: {
			type: "plain_text",
			text: "Cancel",
		},
		blocks: [
			{
				type: "input",
				block_id: "text_block",
				element: {
					type: "plain_text_input",
					action_id: "project_name",
					placeholder: {
						type: "plain_text",
						text: "Enter project name",
					},
				},
				label: {
					type: "plain_text",
					text: "Project Name",
				},
			},
			{
				type: "input",
				block_id: "dropdown_block",
				element: {
					type: "static_select",
					action_id: "priority_select",
					placeholder: {
						type: "plain_text",
						text: "Select priority",
					},
					options: [
						{
							text: { type: "plain_text", text: "High" },
							value: "p1",
						},
						{
							text: { type: "plain_text", text: "Medium" },
							value: "p2",
						},
						{
							text: { type: "plain_text", text: "Low" },
							value: "p3",
						},
					],
				},
				label: {
					type: "plain_text",
					text: "Priority Level",
				},
			},
			{
				type: "input",
				block_id: "date_block",
				element: {
					type: "datepicker",
					action_id: "due_date",
					initial_date: "2025-01-01",
				},
				label: {
					type: "plain_text",
					text: "Due Date",
				},
			},
			{
				type: "input",
				block_id: "time_block",
				element: {
					type: "timepicker",
					action_id: "due_time",
					initial_time: "12:00",
				},
				label: {
					type: "plain_text",
					text: "Submission Time",
				},
			},
			{
				type: "input",
				block_id: "multiselect_block",
				element: {
					type: "multi_static_select",
					action_id: "team_members",
					placeholder: {
						type: "plain_text",
						text: "Select teammates",
					},
					options: [
						{
							text: { type: "plain_text", text: "Design" },
							value: "dept_design",
						},
						{
							text: { type: "plain_text", text: "Engineering" },
							value: "dept_eng",
						},
						{
							text: { type: "plain_text", text: "Marketing" },
							value: "dept_mktg",
						},
					],
				},
				label: {
					type: "plain_text",
					text: "Involved Departments",
				},
			},
		],
	};
}

function renderInitialMessage(context: BarbellContext): KnownBlock[] {
	const { event } = context;
	return [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: `Hello <@${event.user}>! Click the button below to open the project details form.`,
			},
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					text: {
						type: "plain_text",
						text: "Open Modal",
						emoji: true,
					},
					action_id: "open_project_modal",
					style: "primary",
				},
			],
		},
	];
}

function renderMessage(context: BarbellContext): KnownBlock[] {
	// Handle message context (thread messages)
	const { event } = context;
	const threadMessages =
		"threadMessages" in context ? context.threadMessages : [];

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
): Promise<KnownBlock[] | View> {
	// 1. Handle Modal Submissions
	if ("view" in context) {
		const viewContext = context as ViewSubmissionContext;
		const { state } = viewContext.view;
		const projectName = state.text_block?.project_name?.value;
		const priority =
			state.dropdown_block?.priority_select?.selected_option?.value;

		console.log("Form submitted!", { projectName, priority });

		return [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: `*Form Submitted!*\n*Project:* ${projectName}\n*Priority:* ${priority}`,
				},
			},
		];
	}

	// 2. Handle Block Actions (Buttons, etc.)
	if ("blockAction" in context) {
		const actions = context.blockAction || [];
		const isOpeningModal = actions.some(
			(a) => a.action_id === "open_project_modal",
		);

		if (isOpeningModal) {
			return renderModal(context);
		}

		return renderMessage(context);
	}

	// 3. Handle App Mentions (Initial Message)
	return renderInitialMessage(context);
}
