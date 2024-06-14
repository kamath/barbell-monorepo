import Bot, { Action } from "./barbell/bot";
import { sendMessage } from "./barbell/utils/slack";
import { ALERTS_CHANNEL_ID } from "./consts";

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
	name: "Open Garage",
	handler: async ({ io, userId, channelId, channelType }) => {
		await io.output.markdown(`Opening garage... ${userId} ${channelId} ${channelType}`)
		await io.input.button("Open", async () => {
			if (Math.random() > 0.5) {
				await io.output.markdown("Garage opened!")
			} else {
				await io.output.markdown("Garage failed to open!")
			}
		}, 'primary')
		await sendMessage([{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Test"
			}
		}], ALERTS_CHANNEL_ID)
	}
})
bot.defineAction(openGarageAction)

export default bot