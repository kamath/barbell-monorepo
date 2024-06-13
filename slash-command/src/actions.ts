import Bot, { Action } from "./barbell/bot";

const bot = new Bot()
const inputAction = new Action({
	name: "New User",
	handler: async (io) => {
		const fname = await io.input.text("Enter your first name")
		const lname = await io.input.text(`Hi, ${fname}! Enter your last name`)
		const favoriteColors = await io.input.multiSelect("favorite_colors", [
			{ name: "Red", value: "red" },
			{ name: "Green", value: "green" },
			{ name: "Blue", value: "blue" },
		])
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
bot.defineAction(inputAction)

const inputAction2 = new Action({
	name: "New User2",
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
bot.defineAction(inputAction2)


const inputAction3 = new Action({
	name: "New User3",
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
bot.defineAction(inputAction3)


export default bot