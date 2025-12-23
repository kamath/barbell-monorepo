import type { BarbellContext, Block } from "@barbell/sdk";

/**
 * This is your main function. It receives context about the Slack event
 * and should return an array of Slack Block Kit blocks.
 */
export default async function main(context: BarbellContext): Promise<Block[]> {
	const { threadMessages, event } = context;

	// If there are no thread messages, show a welcome message
	if (!threadMessages || threadMessages.length === 0) {
		return [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: `Hello <@${event.user}>! You mentioned me but there's no thread context.`,
				},
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
