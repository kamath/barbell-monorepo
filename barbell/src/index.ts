import Bot, { Action } from "./barbell/bot";

const bot = new Bot()
const newUserAction = new Action({
	name: "New User",
	handler: async (io) => {
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
	name: "Open Garage",
	handler: async (io) => {
		await io.output.markdown("Opening garage...")
		await io.input.button("Open", async () => {
			console.log("\n\n\n\nGarage opened\n\n\n\n")
			await io.output.markdown("Garage opened!")
		})
	}
})
bot.defineAction(openGarageAction)

export default bot