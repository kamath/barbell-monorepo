import { Elysia, t } from "elysia";
import { SlackEventBody, SlackIntent, SlackIntentToBlocks, SlackMentionEventBody, generateBlocksFromIntent, guessIntent, openModal, publishHomeTab, sendMessage, verifyToken } from "../utils/slack";
import { askForHelp, openGarage, openGate, open_garage_and_gate_blocks, open_garage_blocks, open_gate_blocks } from "../utils/openGarage";
import { PrismaClient } from "@prisma/client";
import { publishTestHomeTab } from "../utils/homeTab";
import { Block } from "@slack/web-api";
import { AWS_REGION, ENVIRONMENT, SLACK_VERIFICATION_TOKEN } from "../consts";
import { getSecret } from "../utils/aws";

const prisma = new PrismaClient();
const environment = ENVIRONMENT;

const app = new Elysia()
app.get("/", async () => `Barbell is running in ${environment} with pingpong ${await getSecret("pingpong", AWS_REGION)}`)


app.post("/slack/events", async ({ body }: { body: SlackEventBody }) => {
	console.log("Slack event body", body);
	await prisma.endpointHit.create({
		data: {
			endpoint: "slack/events",
			body: JSON.stringify(body),
			environmentId: environment
		}
	})
	if (!verifyToken(body.token)) {
		console.log("Expected token", SLACK_VERIFICATION_TOKEN, "but got", body.token)
		return { status: 403, token: body.token };
	}
	if ('challenge' in body) {
		return body.challenge;
	}
	// If the bot is the sender, don't send another message
	if ('bot_id' in body.event || (body.event.message && 'bot_id' in body.event.message)) {
		return { status: 200 };
	}
	if (body.event.type === "app_home_opened") {
		console.log("App home opened", body.event.user);
		await publishHomeTab(body.event.user, publishTestHomeTab);
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
			body: JSON.stringify(data),
			environmentId: environment
		}
	})

	let blocks: Block[] = [];
	if (data.actions[0].action_id === "intent_select") {
		const intent = data.actions[0].selected_option.value as SlackIntent;
		const intentValue = SlackIntent[intent as unknown as keyof typeof SlackIntent];
		blocks = SlackIntentToBlocks[intentValue]();
	}
	else if (data.actions[0].action_id === "click__open_mission_st_garage") {
		blocks = await openGarage(prisma, data.user.id);
	}
	else if (data.actions[0].action_id === "click__open_otis_gate") {
		blocks = await openGate(prisma, data.user.id);
	}
	else if (data.actions[0].action_id === "click__ask_for_help") {
		blocks = await askForHelp(data.user.id);
	}

	console.log("GOT BLOCKS", blocks.length)

	if (data.view.type === "home") {
		console.log("Home view", data.view);
		if ('trigger_id' in data) await openModal(data.trigger_id, {
			"type": "modal",
			"callback_id": "modal-identifier",
			"title": {
				"type": "plain_text",
				"text": "Barbell cURL"
			},
			"blocks": blocks
		})
		await publishHomeTab(data.user.id, publishTestHomeTab);
	}
	else await sendMessage(blocks, data.channel.id, data.message.ts);

	return { status: 200 };
});

app.listen(3000);
console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

