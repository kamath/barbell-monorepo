import Bot, { Action } from "./barbell/bot";

const bot = new Bot()
const action = new Action({
	name: "Hello world",
	handler: async (io) => {
		await io.output.markdown("Hello, world!")
	}
})
bot.defineAction(action)

const inputAction = new Action({
	name: "New User",
	handler: async (io) => {
		const name = await io.input.text("Enter your name")
		const email = await io.input.text("Enter your email")
		await io.output.markdown(`New user: ${name} (${email})`)
	}
})
bot.defineAction(inputAction)

export default bot