import Bot, { Action } from "./barbell/bot";
import { sendMessage } from "./barbell/utils/slack";

const bot = new Bot();

const openGarageAction = new Action({
	name: "Open Parking Garage",
	handler: async ({ io, userId }) => {
		await io.input.button(
			"Open Mission St. Garage",
			async () => {
				console.log("OPENING MISSION ST. GARAGE");
			},
			"primary",
		);

		await io.input.button(
			"Open Mission St. Garage (Backup)",
			async () => {
				console.log("OPENING MISSION ST. GARAGE (BACKUP)");
			},
			"primary",
		);

		await io.input.button(
			"Open Otis Garage",
			async () => {
				console.log("OPENING OTIS GARAGE");
			},
			"primary",
		);

		await io.input.button(
			"Ask for Help",
			async () => {
				console.log("ASKING FOR HELP");
			},
			"danger",
		);
	},
});
bot.defineAction(openGarageAction);
bot.defineDefaultAction(openGarageAction);

const bookConferenceRoomAction = new Action({
	name: "Book Conference Room",
	handler: async ({ io, userId }) => {
		await io.output.markdown(
			`*This might be glitchy on mobile due to Slack's SDK*`,
		);
		const startDate = await io.input.date("Date").then((date) => {
			const [year, month, day] = date.split("-").map(Number);
			console.log("DATE", year, month, day);
			return new Date(year, month - 1, day);
		});
		const currentDate = new Date();
		if (startDate < currentDate) {
			await io.output.markdown(`*Please enter a date in the future.*`);
			return;
		}

		const startTime = await io.input.time("Start Time");
		const endTime = await io.input.time("End Time");
		if (startTime > endTime) {
			await io.output.markdown(
				`*Please ensure the start time is before the end time.*`,
			);
			return;
		}
		await io.output.markdown(
			`*Start Time: ${startTime}, End Time: ${endTime}*`,
		);
		const room = await io.input.dropdown("Select Room", [
			{ name: "Room 1", value: "1" },
			{ name: "Room 2", value: "2" },
		]);
		console.log("GOT ROOM", room);
		await io.output.markdown(`*Room: ${room.name}*`);
		await io.input.button(
			"Book Room",
			async () => {
				console.log("BOOKING ROOM", room.value);
				await io.output.markdown(`*Room booked successfully!*`);
				await sendMessage(
					[
						{
							type: "header",
							text: {
								type: "plain_text",
								text: "Conference Room Booking Confirmation",
								emoji: true,
							},
						},
						{
							type: "section",
							text: {
								type: "mrkdwn",
								text: `You have booked *${
									room.name
								}* on ${startDate.toLocaleDateString()} from ${startTime} to ${endTime}`,
							},
						},
					],
					`${userId}`,
				);
			},
			"primary",
		);
	},
});
bot.defineAction(bookConferenceRoomAction);

export default bot;
