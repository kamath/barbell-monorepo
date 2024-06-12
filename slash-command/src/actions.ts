import Bot, { Action, io } from "./barbell/bot";

const bot = new Bot()
const action = new Action({
	name: "Hello world",
	handler: async () => {
		return io.output.markdown("Hello, world!")
	}
})
bot.defineAction(action)

const inputAction = new Action({
	name: "Input",
	handler: async () => {
		const name = await io.input.text("Enter your name")
		return io.output.markdown(`Hello, ${name}!`)
	}
})
bot.defineAction(inputAction)

export default bot