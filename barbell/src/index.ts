import Bot, { Action } from "./barbell/bot";
import { IO } from "./barbell/types/handlerInputs";
import { sendMessage } from "./barbell/utils/slack";
import { askForHelp, openGarage, openGate } from "./utils/openGarage";
import { prisma } from "./utils/prisma";

const bot = new Bot()
const newUserAction = new Action({
	name: "New User",
	handler: async ({ io }) => {
		const fname = await io.input.text("Enter your first name")
		const lname = await io.input.text(`Hi, ${fname}! Enter your last name`)
		await io.output.markdown(`Welcome to Barbell, ${fname} ${lname}!`)
		const dob = await io.input.date("Enter your DOB")
		const age = new Date().getFullYear() - new Date(dob).getFullYear()
		if (age > 18) {
			await io.output.markdown(`${age} > 18, so you are an adult`)
			const email = await io.input.text("Enter your email")
			await io.output.markdown(`New user: ${fname} ${lname} (${email})`)
		} else {
			await io.output.markdown('You are too young to use this service')
		}
	}
})
bot.defineAction(newUserAction)

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

async function testIO(io: IO) {
	await io.output.markdown("should also show")
}

const testButtonClickAction = new Action({
	name: "Test Button Click",
	handler: async ({ io }) => {
		await io.input.button("Test IO", async () => {
			await io.output.markdown("should show")
			await testIO(io)
			await io.output.markdown("should also also show")
		}, 'danger')
	}
})
bot.defineAction(testButtonClickAction)

export default bot