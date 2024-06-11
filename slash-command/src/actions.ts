import Bot, { Action, io } from "./barbell/bot";

const bot = new Bot()
const action = new Action({
	name: "Hello world",
	handler: async () => {
		return io.output.markdown("Hello, world!")
	}
})

bot.defineAction(action)
export default bot