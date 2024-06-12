import Bot, { Action } from "./barbell/bot";

const bot = new Bot()
const action = new Action({
	name: "Hello world",
	handler: async (io) => {
		return io.output.markdown("Hello, world!")
	}
})
bot.defineAction(action)

const inputAction = new Action({
	name: "Input",
	handler: async (io) => {
		const name = io.input.text("Enter your name")
		return io.output.markdown(`Hello, ${name}!`)
	}
})
bot.defineAction(inputAction)

export default bot