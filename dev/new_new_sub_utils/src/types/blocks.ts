    
export type InputType = 'email' | 'date' | 'user_select' | 'plain_text_input' | 'static_select' | 'button_action' | 'rich_text';

export interface InputParameters {
  email?: {
    placeholder: string;
  };
  date?: {
    initial_date: string;
  };
  user_select?: {
    placeholder: string;
  };
  plain_text_input?: {
    label: string;
  };
  static_select?: {
    label: string;
    options: { text: { type: "plain_text", text: string, emoji: boolean }, value: string }[];
  };
  button_action?: {
    text: string;
    value: string;
  };
  rich_text?: {
    text: string;
  };
}

export type InputTypeToBlock = {
  [key in InputType]: (params: InputParameters[key]) => any;
};

export const inputTypeToBlock: InputTypeToBlock = {
    email: (params) => ({
      dispatch_action: true,
      type: "input",
      block_id: "email_input",
      label: {
        type: "plain_text",
        text: "Email Address",
      },
      element: {
        type: "plain_text_input",
        action_id: "email_text_input-action",
        placeholder: {
          type: "plain_text",
          text: params?.placeholder || "Enter an email",
        },
      },
    }),
    date: (params) => ({
      type: "actions",
      elements: [
        {
          type: "datepicker",
          initial_date: params?.initial_date || "1990-04-28",
          placeholder: {
            type: "plain_text",
            text: "Select a date",
            emoji: true,
          },
          action_id: "datepicker-action",
        },
      ],
    }),
    user_select: (params) => ({
      type: "section",
      block_id: "user_select",
      text: {
        type: "mrkdwn",
        text: "Test block with users select",
      },
      accessory: {
        type: "users_select",
        action_id: "users_select-action",
        placeholder: {
          type: "plain_text",
          text: params?.placeholder || "Select a user",
          emoji: true,
        },
      },
    }),
    plain_text_input: (params) => ({
      type: "input",
      block_id: "plain_text_input",
      label: {
        type: "plain_text",
        text: params?.label || "Label",
        emoji: true,
      },
      element: {
        type: "plain_text_input",
        action_id: "plain_text_input-action",
      },
    }),
    rich_text: (params) => ({
      type: "rich_text",
      block_id: "rich_text",
      elements: [
        {
          type: "rich_text_quote",
          elements: [
            {
              type: "text",
              text: params?.text || " ",
            },
          ],
        },
      ],
    }),
    static_select: (params) => ({
      type: "input",
      block_id: "static_select",
      label: {
        type: "plain_text",
        text: params?.label || "Label",
        emoji: true,
      },
      element: {
        type: "static_select",
        action_id: "static_select-action",
        placeholder: {
          type: "plain_text",
          text: params?.label || "Select an item",
          emoji: true,
        },
        options: params?.options || [],
      },
    }),
    button_action: (params) => ({
      type: "actions",
      block_id: "button_action",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: params?.text || "Click Me",
            emoji: true,
          },
          value: params?.value || "click_me_123",
          action_id: "actionId-0",
        },
      ],
    }),
  };