import { WebClient } from '@slack/web-api';
import { inputTypeToBlock, InputType, InputParameters } from '../types/blocks';
import { Logger } from '../utils/logger';
import { BlockAction } from '@slack/bolt';
import { bot as app, Action, BlockActionHandler, slackClient } from '../app';


export async function sendInputBlock<T extends InputType>(channel: string, thread_ts: string, inputType: T, params: InputParameters[T]) {
	if (!params) {
		Logger.error(`No parameters provided for inputType: ${inputType} with channel: ${channel} and thread_ts: ${thread_ts}`);
		return;
	}
	try {
		const block = inputTypeToBlock[inputType](params);
		if (!block) {
			Logger.error(`Failed to generate block for inputType: ${inputType} with params: ${JSON.stringify(params)} and channel ${channel} and thread_ts ${thread_ts}`);
			return;
		}

		const response = await slackClient.chat.postMessage({
			channel,
			thread_ts,
			text: "Message Received",
			blocks: [block],
		});
		const userInput = await awaitUserInput(channel, thread_ts);
		return userInput;

	} catch (error) {
		Logger.error(`Failed to send message for inputType: ${inputType} with error: ${error} and channel ${channel} and thread_ts ${thread_ts}`);
	}
}

async function awaitUserInput(channel: string, thread_ts: string): Promise<any> {
	return new Promise((resolve) => {
		app.action({ action_id: /.*/ }, async ({ action, ack, body, }) => {
			console.log("awaiting: ", body)
			//ack();
			if (body.channel?.id === channel && body.message?.thread_ts === thread_ts) {
				resolve(action);
			}
		});
	});
}
