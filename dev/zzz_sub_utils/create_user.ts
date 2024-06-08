import express from 'express';
import bodyParser from 'body-parser';
import { Action } from './lib/action';
import { createUser, refundCharge } from './test_fn';
import {slackIo} from './lib/slack_io';
const app = express();
app.use(bodyParser.json());
const channel = "33333333";

const actions = [
  new Action({
    name: "Create user",
    handler: async () => {
      const email = await slackIo.inputEmail("Email address", channel);
      const startDate = await slackIo.inputDate("Start date", channel);

      const user = await createUser(email, startDate);


      if (new Date(startDate) > new Date()) {
        await refundCharge("stuff");
      }
    },
  }),
];

app.post('/slack/events', async (req, res) => {
  const { type, event } = req.body;

  if (type === 'url_verification') {
    return res.send({ challenge: req.body.challenge });
  }

  if (type === 'event_callback' && event.type === 'message') {
    const action = actions.find(a => a.name === event.text);
    if (action) {
      await action.execute(event.channel);
    }
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});