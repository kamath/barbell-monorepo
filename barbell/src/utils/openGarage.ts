import { PrismaClient } from "@prisma/client";
import { ALERT_CHANNEL_ID, PARKING_CHANNEL_ID, JACOB_SLACK_ID, ENVIRONMENT, MISSION_ST_SWITCH_URL, OTIS_ST_SWITCH_URL } from "../consts";
import { readChannelMembers, sendMessage } from "../barbell/utils/slack";
import { IO } from "../barbell/types/handlerInputs";

export async function openGarage(io: IO, prisma: PrismaClient, userId: string) {
	console.log("Opening Garage")

	const members = await readChannelMembers(PARKING_CHANNEL_ID)
	if (!members?.includes(userId)) {
		console.error("User not in parking channel for garage: ", userId, members)
		await io.output.markdown(`You are not in the approved users to park in Solaris parking; if this is an error please contact <@${JACOB_SLACK_ID}>`)
		return
	}

	const lastOpened = await prisma.garageLastOpened.findFirst({
		orderBy: {
			createdAt: 'desc'
		}
	})
	console.log("Last Opened: ", lastOpened)
	if (lastOpened && lastOpened.createdAt.getTime() > Date.now() - 1000 * 10) {
		await io.output.markdown("It hasn't been ten seconds since the last person attempted to open the garage, please try again later")
		return
	}
	await prisma.garageLastOpened.create({
		data: {
			userId: userId,
			environmentId: ENVIRONMENT
		}
	});
	try {
		const response = await fetch(MISSION_ST_SWITCH_URL, {
			method: 'POST',
			mode: 'no-cors'
		})
		if (response.status !== 200) {
			throw new Error("Failed to open gate")
		}
		await io.output.markdown("Opening Garage! Please wait a few seconds...")
	} catch (e) {
		console.log("Error opening gate", e)
		await io.output.markdown("Error opening garage, please try again in a few seconds.")
	}
}

export async function openGate(io: IO, prisma: PrismaClient, userId: string) {
	console.log("Opening Gate");

	const members = await readChannelMembers(PARKING_CHANNEL_ID)
	if (!members?.includes(userId)) {
		console.error("User not in parking channel for gate: ", userId, members)
		await io.output.markdown(`You are not in the approved users to park in Solaris parking; if this is an error please contact <@${JACOB_SLACK_ID}>`)
		return
	}
	const lastOpened = await prisma.gateLastOpened.findFirst({
		orderBy: {
			createdAt: 'desc'
		}
	})
	console.log("Last Opened: ", lastOpened)
	if (lastOpened && lastOpened.createdAt.getTime() > Date.now() - 1000 * 10) {
		await io.output.markdown("It hasn't been ten seconds since the last person attempted to open the gate, please try again later")
		return
	}
	await prisma.gateLastOpened.create({
		data: {
			userId: userId,
		}
	});
	try {
		const response = await fetch(OTIS_ST_SWITCH_URL, {
			method: 'POST',
			mode: 'no-cors'
		})
		if (response.status !== 200) {
			throw new Error("Failed to open gate")
		}
		await io.output.markdown(`Opening Gate! Please wait a few seconds...`)
		return
	} catch (e) {
		console.log("Error opening gate", e)
		await io.output.markdown("Error opening gate, please try again in a few seconds.")
		return
	}
}

export async function askForHelp(io: IO, userId: string) {
	console.log("Asking for Help")
	await sendMessage([{
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": "@channel someone (<@" + userId + ">) is requesting help immediately in the garage"
		}
	}], ALERT_CHANNEL_ID);
	console.log("Sent Message")
	await io.output.markdown("Solaris Admin has been notified and will come to help ASAP")
	return
}