// src/types/io.ts

import { App } from '@slack/bolt';
import { sendInputBlock } from '../modules/utils';



export namespace io {
    export class Input {
        static async email(prompt: string, channel: string, thread_ts: string): Promise<string> {
            return await sendInputBlock(channel, thread_ts, "email", { placeholder: prompt });

        }
        static async date(prompt: string, channel: string, thread_ts: string): Promise<Date> {
            return await sendInputBlock(channel, thread_ts, "date", { initial_date: prompt });
        }
        static async user_select(prompt: string, channel: string, thread_ts: string): Promise<string> {
            return await sendInputBlock(channel, thread_ts, "user_select", { placeholder: prompt });
        }
    }
}



