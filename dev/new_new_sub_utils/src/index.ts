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
    const plaintextInput = await io.Input.email("Please enter a plaintext input:", channel, thread_ts);
    console.log("plaintextInput: ", plaintextInput);

    const selectedOptions = await io.Input.static_select("Please select a lookback period:", channel, thread_ts, [
      { text: "1 day", value: "1" },
      { text: "7 days", value: "7" },
      { text: "30 days", value: "30" },
      { text: "90 days", value: "90" },
      { text: "custom", value: "custom" },
    ]);

    switch (selectedOptions) {
      case "custom":
        const custom_date = await io.Input.date("2024-06-09", channel, thread_ts);
        lookbackperiod = {
          days: Math.floor((new Date().getTime() - new Date(custom_date).getTime()) / (1000 * 60 * 60 * 24)),
          lookback_date: new Date(custom_date),
        };
        break;
      default:
        lookbackperiod = {
          days: parseInt(selectedOptions, 10),
          lookback_date: new Date(new Date().setDate(new Date().getDate() - parseInt(selectedOptions, 10))),
        };
        break;
    }
    await io.Input.rich_text("Cursor Orders", channel, thread_ts, `There were ${Math.round(Math.random() * 100)} orders in the past ${lookbackperiod.days} days.`);
  },
});




