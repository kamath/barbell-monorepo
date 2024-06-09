import { PrismaClient } from "@prisma/client";
import { readChannelMembers, sendMessage } from "./slack";

const ALERT_CHANNEL_ID = process.env.ALERT_CHANNEL_ID || ""
const PARKING_CHANNEL_ID = process.env.PARKING_CHANNEL_ID || ""
const JACOB_SLACK_ID = process.env.JACOB_SLACK_ID || "";

const intents = [{
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
					"text": "Open Garage and Gate",
					"emoji": true
				},
				"value": "select__both"
			},
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
}, {
	"type": "section",
	"text": {
		"type": "mrkdwn",
		"text": "Slack <@U075FJ5D1SM> if you enjoy using Barbell and would like to deploy internal tooling on Slack"
	}
}]

export const open_garage_and_gate_blocks = () => {
	return [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Assumed Intent: *Open the Mission St. Garage and Otis St. Gate*"
			}
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Open Outdoor Gate (Mission St.)",
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
						"text": "Open Indoor Gate (Otis St.)",
						"emoji": true
					},
					"value": "click__open_otis_gate",
					"action_id": "click__open_otis_gate",
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
		}
	]
}

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
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Open Mission St. Gate",
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
						"text": "Open Otis St. Gate",
						"emoji": true
					},
					"style": "primary",
					"value": "click__open_otis_gate",
					"action_id": "click__open_otis_gate"
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
		}
	]
}

export async function openGarage(prisma: PrismaClient, userId: string) {
	console.log("Opening Garage")

	const members = await readChannelMembers(PARKING_CHANNEL_ID)
	if (!members?.includes(userId)) {
		console.error("User not in parking channel: ", userId, members)
		return [{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `You are not in the approved users to park in Solaris parking; if this is an error please contact <@${JACOB_SLACK_ID}>`
			}
		}]
	}

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
	});
	try {
		const response = await fetch('https://maker.ifttt.com/trigger/mission_garage_open/with/key/m8rcOHUYrC1iRRiBn0rpicYCXtNWOyHisDwlwK_NY1R', {
			method: 'POST',
			mode: 'no-cors'
		})
		if (response.status !== 200) {
			throw new Error("Failed to open gate")
		}
		return [{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Opening Garage! Please wait a few seconds..."
			}
		}]
	} catch (e) {
		console.log("Error opening gate", e)
		return [{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Error opening garage, please try again in a few seconds."
			}
		}]
	}
}

export async function openGate(prisma: PrismaClient, userId: string) {
	console.log("Opening Gate");

	const members = await readChannelMembers(PARKING_CHANNEL_ID)
	if (!members?.includes(userId)) {
		console.error("User not in parking channel: ", userId, members)
		return [{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `You are not in the approved users to park in Solaris parking; if this is an error please contact <@${JACOB_SLACK_ID}>`
			}
		}]
	}
	const lastOpened = await prisma.gateLastOpened.findFirst({
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
				"text": "It hasn't been ten seconds since the last person attempted to open the gate, please try again later"
			}
		}]
	}
	await prisma.gateLastOpened.create({
		data: {
			userId: userId,
		}
	});
	try {
		const response = await fetch('https://maker.ifttt.com/trigger/otis_garage_open/with/key/m8rcOHUYrC1iRRiBn0rpicYCXtNWOyHisDwlwK_NY1R', {
			method: 'POST',
			mode: 'no-cors'
		})
		if (response.status !== 200) {
			throw new Error("Failed to open gate")
		}
		return [{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `Opening Gate! Please wait a few seconds...`
			}
		}]
	} catch (e) {
		console.log("Error opening gate", e)
		return [{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Error opening gate, please try again in a few seconds."
			}
		}]
	}

}

export async function askForHelp(userId: string) {
	console.log("Asking for Help")
	await sendMessage([{
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": "@channel someone (<@" + userId + ">) is requesting help immediately in the garage"
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