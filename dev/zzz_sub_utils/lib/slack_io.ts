import { WebClient } from '@slack/web-api';

const slackClient = new WebClient(process.env.SLACK_TOKEN);

export const slackIo = {
  async inputPlaintext(prompt: string, channel: string) {
    const result = await slackClient.chat.postMessage({
      channel,
      text: prompt,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: prompt,
          },
        },
        {
          type: 'input',
          block_id: 'plaintext_input',
          element: {
            type: 'plain_text_input',
            action_id: 'plaintext',
          },
          label: {
            type: 'plain_text',
            text: 'Input',
          },
        },
      ],
    });

    const response = await waitForSlackResponse('plaintext_input', 'plaintext');
    return response;
  },

  async inputEmail(prompt: string, channel: string) {
    const result = await slackClient.chat.postMessage({
      channel,
      text: prompt,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: prompt,
          },
        },
        {
          type: 'input',
          block_id: 'email_input',
          element: {
            type: 'plain_text_input',
            action_id: 'email',
          },
          label: {
            type: 'plain_text',
            text: 'Email',
          },
        },
      ],
    });

    const response = await waitForSlackResponse('email_input', 'email');
    return response;
  },

  async inputDate(prompt: string, channel: string) {
    const result = await slackClient.chat.postMessage({
      channel,
      text: prompt,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: prompt,
          },
        },
        {
          type: 'input',
          block_id: 'date_input',
          element: {
            type: 'datepicker',
            action_id: 'date',
          },
          label: {
            type: 'plain_text',
            text: 'Date',
          },
        },
      ],
    });

    const response = await waitForSlackResponse('date_input', 'date');
    return response;
  },

  async inputButton(prompt: string, channel: string, buttonText: string) {
    const result = await slackClient.chat.postMessage({
      channel,
      text: prompt,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: prompt,
          },
        },
        {
          type: 'actions',
          block_id: 'button_input',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: buttonText,
              },
              action_id: 'button',
            },
          ],
        },
      ],
    });

    const response = await waitForSlackResponse('button_input', 'button');
    return response;
  },
};

async function waitForSlackResponse(blockId: string, actionId: string) {
  // Implement logic to wait for and capture the user's response from Slack
  // This will likely involve setting up an event listener for Slack interactions
}