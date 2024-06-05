import { Elysia, t } from "elysia";
import { sendMessage, verifyToken } from "../utils/slack";
import { askForHelp, openGarage, openGate, open_garage_blocks, open_gate_blocks } from "../utils/openGarage";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = new Elysia()
app.get("/", () => "Hello Elysia")
type SlackChallengeEventBody = {
	type: string;
	token: string;
	challenge: string;
	[propName: string]: any; // This allows for additional properties
}

type SlackMentionEventBody = {
	type: string,
	event_id: string,
	event_time: number,
	token: string,
	team_id: string,
	api_app_id: string,
	event: {
		user: string,
		type: "app_mention",
		ts: string,
		client_msg_id: string,
		text: string,
		team: string,
		blocks: {
			type: string,
			block_id: string,
			elements: any[]
		}[],
		channel: string,
		event_ts: string,
		message?: any
	},
	authorizations: {
		enterprise_id: string | null,
		team_id: string,
		user_id: string,
		is_bot: boolean,
		is_enterprise_install: boolean
	}
};

type SlackEventBody = SlackChallengeEventBody | SlackMentionEventBody;

app.post("/slack/events", async ({ body }: { body: SlackEventBody }) => {
	console.log("BODY", body);
	console.log("Body text", body.event.text);
	await prisma.endpointHit.create({
		data: {
			endpoint: "slack/events",
			body: JSON.stringify(body)
		}
	})
	if (!verifyToken(body.token)) {
		return { status: 403 };
	}
	if ('challenge' in body) {
		return body.challenge;
	}
	// If the bot is the sender, don't send another message
	if ('bot_id' in body.event || (body.event.message && 'bot_id' in body.event.message)) {
		return { status: 200 };
	}
	let event: SlackMentionEventBody = body;
	if (event.event.text.includes('open') || event.event.text.includes('garage')) {
		const blocks = open_garage_blocks();
		await sendMessage(blocks, event.event.channel, event.event.ts);
	}
	console.log("Sent ")
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
	if (data.actions[0].action_id === "click__open_otis_gate") {
		const blocks = await openGate();
		await sendMessage(blocks, data.channel.id, data.message.ts);
	}
	if (data.actions[0].action_id === "click__ask_for_help") {
		console.log("Sending message to", data.channel.id, data.message.ts);
		const helpBlocks = await askForHelp();
		await sendMessage(helpBlocks, data.channel.id, data.message.ts);
	}
	if (data.actions[0].action_id === "intent_select") {
		console.log("Sending message to", data.channel.id, data.message.ts);
		if (data.actions[0].selected_option.value === "select__mission_st") {
			await sendMessage(open_garage_blocks(), data.channel.id, data.message.ts);
		}
		if (data.actions[0].selected_option.value === "select__otis_gate") {
			await sendMessage(open_gate_blocks(), data.channel.id, data.message.ts);
		}
	}
	return { status: 200 };
});

app.listen(3000);
console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
