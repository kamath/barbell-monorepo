import Bot, { Action } from "./barbell/bot";
import { sendMessage } from "./barbell/utils/slack";
import { bookRoom, getAvailableRooms } from "./utils/bookings";
import { askForHelp, openGarage, openGarageBackup, openGate } from "./utils/openGarage";
import { prisma } from "./utils/prisma";

const bot = new Bot()

const openGarageAction = new Action({
	name: "Open Parking Garage",
	handler: async ({ io, userId }) => {
		await io.input.button("Open Mission St. Garage", async () => {
			await openGarage(io, prisma, userId)
		}, 'primary')

		await io.input.button("Open Mission St. Garage (Backup)", async () => {
			await openGarageBackup(io, prisma, userId)
		}, 'primary')

		await io.input.button("Open Otis Garage", async () => {
			await openGate(io, prisma, userId)
		}, 'primary')

		await io.input.button("Ask for Help", async () => {
			await askForHelp(io, userId)
		}, 'danger')
	}
})
bot.defineAction(openGarageAction)
bot.defineDefaultAction(openGarageAction)

const bookConferenceRoomAction = new Action({
	name: "Book Conference Room",
	handler: async ({ io, userId }) => {
		await io.output.markdown(`*Booking a conference room is under construction, coming soon!*`)
		const startDate = await io.input.date("Date").then((date) => {
			const [year, month, day] = date.split('-').map(Number);
			console.log("DATE", year, month, day)
			return new Date(year, month - 1, day);
		});
		const currentDate = new Date();
		if (startDate < currentDate) {
			await io.output.markdown(`*Please enter a date in the future.*`)
			return
		}

		const startTime = await io.input.time("Start Time")
		const endTime = await io.input.time("End Time")
		if (startTime > endTime) {
			await io.output.markdown(`*Please ensure the start time is before the end time.*`)
			return
		}
		await io.output.markdown(`*Start Time: ${startTime}, End Time: ${endTime}*`)
		const availableRooms = await getAvailableRooms(startDate, startTime, endTime)
		await io.output.markdown(`*Available Rooms: ${availableRooms.map(room => room.name).join(', ')}*`)
		const room = await io.input.dropdown("Select Room", availableRooms.map(room => ({
			name: room.name,
			value: room.id
		})))
		console.log("GOT ROOM", room)
		await io.output.markdown(`*Room: ${room.name}, ${room.value}*`)
		await io.input.button("Book Room", async () => {
			await bookRoom(room.value, startDate, startTime, endTime)
			await io.output.markdown(`*Room booked successfully!*`)
			await sendMessage([
				{
					"type": "header",
					"text": {
						"type": "plain_text",
						"text": "Conference Room Booking Confirmation",
						"emoji": true
					}
				},
				{
					"type": "section",
					"text": {
						"type": "mrkdwn",
						"text": `You have booked *${room.name}* on ${startDate.toLocaleDateString()} from ${startTime} to ${endTime}`
					}
				}
			], `${userId}`)
		}, 'primary')
	}
})
bot.defineAction(bookConferenceRoomAction)

export default bot