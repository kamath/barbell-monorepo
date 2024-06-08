import { bot, BlockActionHandler, Action } from './app';
import { io } from './types/io';
import { createUser, startTrial } from './modules/users';
require('dotenv').config();


bot.defineAction({
    name: 'Create user',
    handler: async (payload: any) => {  // Ensure the handler accepts a parameter
      const channel = payload.channel
      const thread_ts = payload.ts;
      console.log(thread_ts)
      console.log(channel, "this is the channel")
  
      const email = await io.Input.email('Please enter your email address:', channel, thread_ts);
      console.log("hi")
      const startDateString = await io.Input.date('Please select a start date:', channel, thread_ts);
      const startDate = new Date(startDateString);
      const user = await createUser({ email });
  
      if (startDate > new Date()) {
        await startTrial(user.id, startDate);
      }
    },
  });

  bot.defineBlockAction({
    actionId: 'email_text_input-action',
    handler: async (payload: any) => {
        console.log("payload: ", payload);
      return payload.value;
    }
  })


  bot.defineBlockAction({
    actionId: 'datepicker-action',
    handler: async (payload: any) => {
        console.log("payload: ", payload);
      return payload.value;
    }
  })

