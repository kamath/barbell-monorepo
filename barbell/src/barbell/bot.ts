import { Block } from "@slack/web-api";
import { BarbellIOError } from "./types/ioError";
import { INIT_MODAL_NAME } from "./consts";

abstract class InputOutput {
  constructor(readonly name: string) {}
  abstract render(): Block[];
}

abstract class Input extends InputOutput {
  public value: string | number | boolean | (string | number | boolean | object)[] | undefined;
  constructor(readonly name: string, value?: string | number | boolean | (string | number | boolean | any)[]) {
    super(name);
    this.value = value;
  }
  setValue(value: string | number | boolean | (string | number | boolean | object | any)[]) {
    this.value = value;
  }
  ensureValue() {
    if (!this.value) {
      throw new BarbellIOError(`Value for ${this.name} is not set`);
    }
  }
  abstract getValue(): Promise<string | number | boolean | (string | number | boolean | any)[]>;

  //abstract getValue(): string | number | boolean | (string | number | boolean)[]
  abstract render(): Block[];
  static fromSlackState(
    name: string,
    state: {
      type: string;
      [key: string]: any;
    }
  ) {
    if (state.type === "plain_text_input") {
      return new TextInput(name, state.value);
    }
    if (state.type === "datepicker") {
      return new DateInput(name, state.selected_date);
    }
    if (state.type === "multi_static_select") {
      // TODO: Fix.
      // return new MultiSelectInput(name, state.selected_options.map((option: { text: { text: string }, value: string }) => ({
      // 	name: option.text.text,
      // 	value: option.value
      // })))
      console.log("THE OPTIONS ARE BEING SHOWN BELIOW: ", state);
      return new MultiSelectInput(
        name,
        state.options,
        state.selected_options.map((option: { text: { text: string }; value: string }) => ({
          name: option.text.text,
          value: option.value,
        }))
      );
    }
    throw new Error(`Unknown input type: ${state.type}`);
  }
}

class TextInput extends Input {
  constructor(name: string, value?: string | undefined) {
    super(name, value);
    if (value !== undefined && typeof value !== "string") {
      throw new TypeError(`Value for ${name} must be a string`);
    }
  }
  render() {
    return [
      {
        dispatch_action: true,
        type: "input",
        element: {
          type: "plain_text_input",
          multiline: false,
          action_id: this.name,
          dispatch_action_config: {
            trigger_actions_on: ["on_enter_pressed"],
          },
          ...(this.value ? { initial_value: this.value } : {}),
        },
        label: {
          type: "plain_text",
          text: this.name,
          emoji: true,
        },
      },
    ];
  }
  async getValue() {
    this.ensureValue();
    return this.value as string;
  }
}

class DateInput extends Input {
  constructor(name: string, value?: string | undefined) {
    super(name, value);
  }
  render() {
    return [
      {
        type: "actions",
        elements: [
          {
            type: "datepicker",
            ...(this.value ? { initial_date: this.value } : {}),
            placeholder: {
              type: "plain_text",
              text: this.name,
              emoji: true,
            },
            action_id: this.name,
          },
        ],
      },
    ];
  }
  async getValue() {
    this.ensureValue();
    return this.value as string;
  }
}

class ButtonInput extends Input {
  private readonly onClick: () => Promise<void>;
  private readonly style: "default" | "primary" | "danger";
  constructor(name: string, onClick: () => Promise<void>, style: "default" | "primary" | "danger") {
    super(name);
    this.onClick = onClick;
    this.style = style;
  }
  render() {
    return [
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: this.name,
              emoji: true,
            },
            value: this.name,
            action_id: this.name,
            ...(this.style !== "default" ? { style: this.style } : {}),
          },
        ],
      },
    ];
  }
  async getValue() {
    await this.onClick();
    return true;
  }
}

class MultiSelectInput extends Input {
  private options: { name: string; value: string | number | boolean }[];

  constructor(
    name: string,
    options: { name: string; value: string | number | boolean }[] = [],
    value?: { name: string; value: string | number | boolean }[]
  ) {
    super(name, value);
    this.options = options;
  }
  render() {
    return [
      {
        type: "input",
        dispatch_action: true,
        element: {
          type: "multi_static_select",
          action_id: this.name,
          options: this.options.map((option) => ({
            text: {
              type: "plain_text",
              text: option.name,
              emoji: true,
            },
            value: option.value.toString(),
          })),
          ...(this.value
            ? {
                initial_options: (this.value as any[]).map((option) => ({
                  text: {
                    type: "plain_text",
                    text: option.name,
                    emoji: true,
                  },
                  value: option.value.toString(),
                })),
              }
            : {}),
        },
        label: {
          type: "plain_text",
          text: this.name,
          emoji: true,
        },
      },
    ];
  }
  async getValue() {
    this.ensureValue();
    //						return new MultiSelectInput(name, state.selected_options.map((option: { text: { text: string }, value: string }) => ({
    // 	name: option.text.text,
    // 	value: option.value
    // })))
    return this.options.filter((option) => (this.value as any[]).includes(option.value)).map((option) => option.value);
    //return this.options.map(option => option.value).filter((value, index, self) => self.indexOf(value) === index)
  }
}

abstract class Output extends InputOutput {
  constructor(name: string) {
    super(name);
  }
  abstract render(): Block[];
}

class MarkdownOutput extends Output {
  constructor(private readonly value: string) {
    super(value);
  }
  render() {
    return [
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            text: this.value,
            emoji: true,
          },
        ],
      },
    ];
  }
}

type IO = {
  input: {
    text: (name: string) => Promise<string>;
    date: (name: string) => Promise<string>;
    button: (name: string, onClick: () => Promise<void>, style?: "default" | "primary" | "danger") => Promise<void>;
    multiSelect: (
      name: string,
      options: { name: string; value: string | number | boolean }[]
    ) => Promise<(string | number | boolean)[]>;
  };
  output: {
    markdown: (value: string) => Promise<MarkdownOutput>;
  };
};

class ActionRunner {
  readonly io: IO;
  private state: Record<string, Input> = {};
  private inputoutputs: InputOutput[] = [];
  readonly name: string;
  readonly handler: (io: IO) => Promise<void>;

  constructor({ name, handler }: { name: string; handler: (io: IO) => Promise<void> }) {
    if (name === INIT_MODAL_NAME) {
      throw new Error("Action name cannot be the same as the initial modal name");
    }
    this.name = name;
    this.io = {
      input: {
        text: async (name: string): Promise<string> => {
          console.log("ADDING TEXT INPUT", name);
          if (this.state[name]) {
            const input = this.state[name] as TextInput;
            this.inputoutputs.push(input);
            return input.getValue();
          }
          const input = new TextInput(name);
          this.inputoutputs.push(input);
          throw new BarbellIOError(`Input ${name} is not set`);
        },
        date: async (name: string): Promise<string> => {
          console.log("ADDING DATE INPUT", name);
          if (this.state[name]) {
            const input = this.state[name] as DateInput;
            this.inputoutputs.push(input);
            return input.getValue();
          }
          const input = new DateInput(name);
          this.inputoutputs.push(input);
          throw new BarbellIOError(`Input ${name} is not set`);
        },
        multiSelect: async (
          name: string,
          options: { name: string; value: string | number | boolean }[]
        ): Promise<(string | number | boolean)[]> => {
          console.log("ADDING MULTISELECT INPUT", name);
          console.log("ADDING CUSTOM OPTIONS ", options);
          if (this.state[name]) {
            const input = this.state[name] as MultiSelectInput;
            // create a new input with the new options
            const newInput = new MultiSelectInput(name, options, input.value);
            // remove the initial input form the state
            delete this.state[name];
            this.inputoutputs.push(newInput);
            return newInput.getValue();
          }
          const input = new MultiSelectInput(name, options);
          this.inputoutputs.push(input);
          throw new BarbellIOError(`Input ${name} is not set`);
        },
        button: async (
          name: string,
          onClick: () => Promise<void>,
          style?: "default" | "primary" | "danger"
        ): Promise<void> => {
          const input = new ButtonInput(name, onClick, style || "default");
          this.inputoutputs.push(input);
        },
      },
      output: {
        markdown: async (value: string): Promise<MarkdownOutput> => {
          if (this.inputoutputs.find((inputoutput) => inputoutput.name === value)) {
            return this.inputoutputs.find((inputoutput) => inputoutput.name === value) as MarkdownOutput;
          }
          const output = new MarkdownOutput(value);
          this.inputoutputs.push(output);
          return output;
        },
      },
    };
    this.handler = handler;
  }

  public async run(
    inputs?: Record<string, Input> | undefined,
    buttonClick?: { action: string; value: string } | undefined
  ): Promise<Block[]> {
    console.log("INPUTS", this.inputoutputs);
    if (inputs) {
      this.state = inputs;
    }
    await this.handler(this.io).catch(async (e) => {
      if (e instanceof BarbellIOError) {
        console.error("BarbellIOError:", e.message);
      } else {
        console.error(e);
        throw e;
      }
    });
    await Promise.all(this.inputoutputs.map((inputoutput) => inputoutput.render()));
    if (buttonClick) {
      this.inputoutputs
        .filter((inputoutput) => inputoutput.name === buttonClick.value)
        .forEach(async (inputoutput) => {
          if (inputoutput instanceof ButtonInput) {
            await inputoutput.getValue();
          }
        });
    }
    const toReturn = (await Promise.all(this.inputoutputs.map((inputoutput) => inputoutput.render()))).flat();
    console.log("RENDERING BLOCKS", toReturn);
    return toReturn;
  }
}

export class Action {
  readonly name: string;
  readonly handler: (io: IO) => Promise<void>;

  constructor({ name, handler }: { name: string; handler: (io: IO) => Promise<void> }) {
    this.name = name;
    this.handler = handler;
  }
  async run(
    inputs?: Record<string, { type: string; [key: string]: any }> | undefined,
    buttonClick?: { action: string; value: string } | undefined
  ) {
    const actionRunner = new ActionRunner({ name: this.name, handler: this.handler }); // Allow everything to be stateless server-side
    if (inputs) {
      const definedInputs = Array.from(Object.keys(inputs))
        .map((key) => ({ [key]: Input.fromSlackState(key, inputs[key]) }))
        .reduce((acc, input) => ({ ...acc, ...input }), {});
      console.log("PREDEFINED INPUTS", definedInputs);
      return await actionRunner.run(definedInputs, buttonClick);
    }
    return await actionRunner.run(undefined, buttonClick);
  }
}

export default class Bot {
  private actions: Record<string, Action> = {};
  constructor() {}
  defineAction(action: Action) {
    if (action.name in this.actions) {
      throw new Error(`Duplicate action ${action.name}`);
    }
    this.actions[action.name] = action;
  }
  getActions() {
    return this.actions;
  }
  getAction(name: string) {
    return this.actions[name];
  }
}
