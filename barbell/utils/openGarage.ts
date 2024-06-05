import { PrismaClient } from "@prisma/client";
import { sendMessage } from "./slack";

const ALERT_CHANNEL_ID = 'C076B7XL3B9'

export const open_garage_blocks = () => {
	return [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Assumed Intent: *Open the Mission St. Garage*\nClicking the button below will open the Mission St. Garage"
			}
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Open Mission St. Garage",
						"emoji": true
					},
					"value": "click__open_mission_st_garage",
					"action_id": "click__open_mission_st_garage",
					"style": "primary"
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Ask for Help",
						"emoji": true,
					},
					"style": "danger",
					"value": "click__ask_for_help",
					"action_id": "click__ask_for_help"
				}
			]
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "...or select a different intent from the list:"
			},
			"accessory": {
				"type": "static_select",
				"placeholder": {
					"type": "plain_text",
					"text": "Select an item",
					"emoji": true
				},
				"options": [
					{
						"text": {
							"type": "plain_text",
							"text": "Open Mission St. Garage",
							"emoji": true
						},
						"value": "select__mission_st"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "Open Otis Gate",
							"emoji": true
						},
						"value": "select__otis_gate"
					},
				],
				"action_id": "intent_select"
			}
		}
	]
}

export const open_gate_blocks = () => {
	return [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Assumed Intent: *Open the Otis Gate*\nClicking the button below will open the Otis Gate"
			}
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Open Otis Gate",
						"emoji": true
					},
					"style": "primary",
					"value": "click__open_otis_gate",
					"action_id": "click__open_otis_gate"
				}
			]
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "...or select a different intent from the list:"
			},
			"accessory": {
				"type": "static_select",
				"placeholder": {
					"type": "plain_text",
					"text": "Select an item",
					"emoji": true
				},
				"options": [
					{
						"text": {
							"type": "plain_text",
							"text": "Open Mission St Garage",
							"emoji": true
						},
						"value": "select__mission_st"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "Open Otis Gate",
							"emoji": true
						},
						"value": "select__otis_gate"
					},
				],
				"action_id": "intent_select"
			}
		}
	]
}

export async function openGarage(prisma: PrismaClient, userId: string) {
	console.log("Opening Garage")
	const lastOpened = await prisma.garageLastOpened.findFirst({
		orderBy: {
			createdAt: 'desc'
		}
	})
	console.log("Last Opened: ", lastOpened)
	if (lastOpened && lastOpened.createdAt.getTime() > Date.now() - 1000 * 10) {
		return [{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "It hasn't been ten seconds since the last person attempted to open the garage, please try again later"
			}
		}]
	}
	await prisma.garageLastOpened.create({
		data: {
			userId: userId,
		}
	})
	return [{
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": "Opening Garage! Please wait a few seconds..."
		}
	}]
}

export async function openGate() {
	console.log("Opening Gate")
	return [{
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": "This is still a WIP, please use the physical clicker to open this gate"
		}
	}]
}

export async function askForHelp() {
	console.log("Opening Gate")
	await sendMessage([{
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": "@channel someone is requesting help immediately in the garage"
		}
	}], ALERT_CHANNEL_ID);
	return [{
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": "Solaris Admin has been notified and will come to help ASAP"
		}
	}]
}