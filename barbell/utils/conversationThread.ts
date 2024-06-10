export const replyToThread = () => {
	return [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "What's up brother"
			}
		},
		{
			"dispatch_action": true,
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"action_id": "plain_text_input-action"
			},
			"label": {
				"type": "plain_text",
				"text": "Label",
				"emoji": true
			}
		}
	]
}