import {
  type Block,
  type ChatPostMessageArguments,
  type KnownBlock,
  LogLevel,
  WebClient,
} from "@slack/web-api";
import { getSlackSecrets } from "../consts";

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
export const getSlackClient = (env: Env): WebClient => {
  const secrets = getSlackSecrets(env);
  if (!secrets.SLACK_OAUTH_TOKEN) {
    throw new Error("SLACK_OAUTH_TOKEN is not set in environment variables");
  }
  return new WebClient(secrets.SLACK_OAUTH_TOKEN, {
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.DEBUG,
  });
};

export const openModal = async (
  client: WebClient,
  trigger_id: string,
  blocks: Block[],
  title: string,
  submit?: string
) => {
  await client.views.open({
    trigger_id,
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: title,
      },
      submit: {
        type: "plain_text",
        text: submit || "Submit",
      },
      blocks,
    },
  });
};

export const updateModal = async (
  client: WebClient,
  viewId: string,
  blocks: Block[],
  title: string,
  submit?: string
) => {
  await client.views.update({
    view_id: viewId,
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: title,
      },
      submit: {
        type: "plain_text",
        text: submit || "Submit",
      },
      blocks,
    },
  });
};

// TODO: This is a hack, but it works for now
export const getActionValue = (action: any): string => {
  if (action.type === "static_select") {
    return action.selected_option.value;
  }
  if (action.type === "plain_text_input") {
    return action.value;
  }
  throw new Error(`Unsupported action type: ${action.type}`);
};

export const publishHomeTab = async (
  client: WebClient,
  user_id: string,
  blocks: Block[],
  title: string
) => {
  await client.views.publish({
    user_id,
    view: {
      type: "home",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: title,
          },
        },
        ...blocks,
        {
          type: "divider",
        },
      ],
    },
  });
  console.log("Published home tab", blocks);
  return { status: 200 };
};

// TODO: Take in InputOutput type instead of Slack blocks
export const sendMessage = async (
  client: WebClient,
  blocks: (Block | KnownBlock)[],
  channel: string,
  thread_ts?: string,
  reply_broadcast: boolean = true
) => {
  await client.chat.postMessage({
    channel: channel,
    blocks: blocks,
    ...(thread_ts ? { thread_ts: thread_ts } : {}),
    ...(reply_broadcast ? { reply_broadcast: true } : {}),
  } as ChatPostMessageArguments);
};

export const readChannelMembers = async (
  client: WebClient,
  channel: string
) => {
  const members = await client.conversations.members({ channel });
  return members.members;
};
