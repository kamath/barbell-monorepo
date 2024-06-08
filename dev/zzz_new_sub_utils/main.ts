// main.ts
import Action from './lib/Action';
import IOClient from './lib/IOClient';
import { createUser, startTrial } from './lib/userFunctions';
import { Logger } from './lib/Logger';


// Create an instance of the Action class
const action = new Action({
  name: "Create user",
  handler: async () => {
    const io = new IOClient("general"); // Assuming 'user-creation-channel' is the Slack channel ID
    const email = await io.input('email', "Email address");
    const startDate = await io.input('date', "Start date");

    const user = await createUser({ email });

    if (new Date(startDate) > new Date()) {
      await startTrial(user.id, startDate);
    }
  },
});

// Execute the action
action.execute().then(() => {
  Logger.info("Action executed successfully.");
}).catch(error => {
  Logger.error("Failed to execute action: " + error);
});


