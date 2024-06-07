import { Elysia, t } from "elysia";
import { SlackEventBody, SlackIntent, SlackIntentToBlocks, SlackMentionEventBody, generateBlocksFromIntent, guessIntent, sendMessage, verifyToken } from "../utils/slack";
import { askForHelp, openGarage, openGate, open_garage_and_gate_blocks, open_garage_blocks, open_gate_blocks } from "../utils/openGarage";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const environment = process.env.ENVIRONMENT || "NO_ENVIRONMENT_SPECIFIED";

const app = new Elysia()
app.get("/", () => `Barbell is running in ${environment}`)


app.post("/slack/events", async ({ body }: { body: SlackEventBody }) => {
	console.log("Slack event body", body);
	await prisma.endpointHit.create({
		data: {
			endpoint: "slack/events",
			body: JSON.stringify(body)
		}
	})
	if (!verifyToken(body.token)) {
		console.log("Expected token", process.env.SLACK_VERIFICATION_TOKEN, "but got", body.token)
		return { status: 403, token: body.token };
	}
	if ('challenge' in body) {
		return body.challenge;
	}
	// If the bot is the sender, don't send another message
	if ('bot_id' in body.event || (body.event.message && 'bot_id' in body.event.message)) {
		return { status: 200 };
	}
	let event: SlackMentionEventBody = body;
	const intent = await guessIntent(event);
	const blocks = await generateBlocksFromIntent(intent);
	await sendMessage(blocks, event.event.channel, event.event.ts);
	console.log("Sent message")
	return { status: 200 };
});

app.post("/interactivity", async ({ body }: { body: { payload: string } }) => {
	const data = JSON.parse(body.payload)
	console.log("Interactivity body", data, '\n\n\n\n');
	await prisma.endpointHit.create({
		data: {
			endpoint: "interactivity",
			body: JSON.stringify(data)
		}
	})
	if (data.actions[0].action_id === "click__open_mission_st_garage") {
		const blocks = await openGarage(prisma, data.user.id);
		await sendMessage(blocks, data.channel.id, data.message.ts);
	}
	else if (data.actions[0].action_id === "click__open_otis_gate") {
		const blocks = await openGate(prisma, data.user.id);
		await sendMessage(blocks, data.channel.id, data.message.ts);
	}
	else if (data.actions[0].action_id === "click__ask_for_help") {
		console.log("Sending message to", data.channel.id, data.message.ts);
		const helpBlocks = await askForHelp(data.user.id);
		await sendMessage(helpBlocks, data.channel.id, data.message.ts);
	}
	else if (data.actions[0].action_id === "intent_select") {
		console.log("Sending message to", data.channel.id, data.message.ts);
		const intent = data.actions[0].selected_option.value as SlackIntent;
		const intentValue = SlackIntent[intent as unknown as keyof typeof SlackIntent];
		console.log("Intent", intent, intentValue)
		console.log("Slack intent to blocks", SlackIntentToBlocks)
		const blocks = SlackIntentToBlocks[intentValue]();
		console.log("Blocks", blocks)
		await sendMessage(blocks, data.channel.id, data.message.ts);
	}
	return { status: 200 };
});

app.listen(3000);
console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

