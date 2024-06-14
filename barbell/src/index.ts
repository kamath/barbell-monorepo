import Bot, { Action } from "./barbell/bot";
import { IO } from "./barbell/types/handlerInputs";
import { sendMessage } from "./barbell/utils/slack";
import { askForHelp, openGarage, openGate } from "./utils/openGarage";
import { prisma } from "./utils/prisma";

const bot = new Bot()

const openGarageAction = new Action({
	name: "Open Parking Garage",
	handler: async ({ io, userId }) => {
		await io.input.button("Open Mission St. Garage", async () => {
			await openGarage(io, prisma, userId)
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
	handler: async ({ io }) => {
		await io.output.markdown(`*Booking a conference room is under construction, coming soon!*`)
	}
})
bot.defineAction(bookConferenceRoomAction)

export default bot