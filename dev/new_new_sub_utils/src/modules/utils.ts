import { WebClient } from '@slack/web-api';
import { inputTypeToBlock, InputType, InputParameters } from '../types/blocks';
import { Logger } from '../utils/logger'; 
import { bot as app, Action, BlockActionHandler} from '../app';

const slackClient = new WebClient(process.env.SLACK_BOT_SECRET);


export async function sendInputBlock<T extends InputType>(channel: string, thread_ts: string, inputType: T, params: InputParameters[T]) {
    console.log(channel, "this is the channel")
    console.log(thread_ts, "this is the thread_ts")
    console.log(inputType, "this is the inputType")
    console.log(params, "this is the params")
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
      

        Logger.info(`Message sent successfully to channel ${channel} with response: ${JSON.stringify(response)}`);

        // Await user input here
        
    } catch (error) {
        Logger.error(`Failed to send message for inputType: ${inputType} with error: ${error} and channel ${channel} and thread_ts ${thread_ts}`);
    }
}

async function awaitUserInput(channel: string, thread_ts: string): Promise<any> {
    return new Promise((resolve) => {
      app.addActionListener("action_id: /.*/", async (payload: any) => {
        console.log("payloadz: ", payload);
        resolve(payload);
      });
    });
  }


