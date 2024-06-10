import { bot, BlockActionHandler, Action } from "./app";
import { io } from "./types/io";
import { createUser, startTrial } from "./modules/users";
require("dotenv").config();
type LookbackPeriod = {
  days: number;
  lookback_date: Date;
};

bot.defineAction({
  name: "num orders",
  handler: async (payload: any) => {
    // Ensure the handler accepts a parameter
    const channel = payload.channel;
    const thread_ts = payload.ts;
    let lookbackperiod: LookbackPeriod;

    const selectedOptions = await io.Input.static_select("Please select a lookback period:", channel, thread_ts, [
      { text: { type: "plain_text", text: "1 day", emoji: true }, value: "1" },
      { text: { type: "plain_text", text: "7 days ", emoji: true }, value: "7" },
      { text: { type: "plain_text", text: "30 days", emoji: false }, value: "30" },
      { text: { type: "plain_text", text: "90 days", emoji: false }, value: "90" },
      { text: { type: "plain_text", text: "custom ", emoji: false }, value: "custom" },
    ]);

    switch (selectedOptions.selected_option.value) {
      case "custom":
        const custom_date = await io.Input.date("2024-06-09", channel, thread_ts);
        lookbackperiod = {
          days: Math.floor((new Date().getTime() - new Date(custom_date.selected_date).getTime()) / (1000 * 60 * 60 * 24)),
          lookback_date: new Date(custom_date.selected_date),
        };
        break;
      default:
        lookbackperiod = {
          days: parseInt(selectedOptions.selected_option.value, 10),
          lookback_date: new Date(new Date().setDate(new Date().getDate() - parseInt(selectedOptions, 10))),
        };
        break;
    }
    await io.Input.rich_text("Cursor Orders", channel, thread_ts, `There were ${Math.round(Math.random() * 100)} orders in the past ${lookbackperiod.days} days.`);
  },
});



// TBD ( To be deprecated)
bot.defineBlockAction({
  actionId: "email_text_input-action",
  handler: async (payload: any) => {
    console.log("payload: ", payload);
    return payload.value;
  },
});

bot.defineBlockAction({
  actionId: "datepicker-action",
  handler: async (payload: any) => {
    console.log("payload: ", payload);
    return payload.value;
  },
});

bot.defineBlockAction({
  actionId: "static_select-action",
  handler: async (payload: any) => {
    console.log("payload: ", payload);
    return payload.value;
  },
});

// define for rich_text
bot.defineBlockAction({
  actionId: "rich_text",
  handler: async (payload: any) => {
    console.log("payload: ", payload);
    return payload.value;
  },
});
