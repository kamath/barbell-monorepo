import { Block } from "@slack/web-api"
import { BarbellIOError } from "../types/ioError"
import { INIT_MODAL_NAME } from "../consts"

abstract class InputOutput {
	constructor(readonly name: string) { }
	abstract render(): Block[]
}

abstract class Input extends InputOutput {
	public value: string | number | boolean | undefined
	constructor(readonly name: string, value?: string | number | boolean | undefined) {
		super(name)
		this.value = value
	}
	setValue(value: string | number | boolean) {
		this.value = value
	}
	ensureValue() {
		if (!this.value) {
			throw new BarbellIOError(`Value for ${this.name} is not set`)
		}
	}
	abstract getValue(): string | number | boolean
	abstract render(): Block[]
}

class TextInput extends Input {
	constructor(name: string, value?: string | undefined) {
		super(name, value)
		if (value !== undefined && typeof value !== 'string') {
			throw new TypeError(`Value for ${name} must be a string`);
		}
	}
	render() {
		return [
			{
				"dispatch_action": true,
				"type": "input",
				"element": {
					"type": "plain_text_input",
					"action_id": this.name
				},
				"label": {
					"type": "plain_text",
					"text": this.name,
					"emoji": true
				}
			}
		]
	}
	getValue() {
		this.ensureValue()
		return this.value as string
	}
}

class DateInput extends Input {
	constructor(name: string, value?: string | undefined) {
		super(name, value)
	}
	render() {
		return [
			{
				"type": "actions",
				"elements": [
					{
						"type": "datepicker",
						"placeholder": {
							"type": "plain_text",
							"text": this.name,
							"emoji": true
						},
						"action_id": this.name
					}
				]
			}
		]
	}
	getValue() {
		this.ensureValue()
		return this.value as string
	}
}

abstract class Output extends InputOutput {
	constructor(name: string) {
		super(name)
	}
	abstract render(): Block[]
}

class MarkdownOutput extends Output {
	constructor(private readonly value: string) {
		super(value)
	}
	render() {
		return [
			{
				"type": "context",
				"elements": [
					{
						"type": "plain_text",
						"text": this.value,
						"emoji": true
					}
				]
			}
		]
	}
}

const io = {
	input: {
		text: async (name: string) => new TextInput(name),
		date: async (name: string) => new DateInput(name)
	},
	output: {
		markdown: async (value: string) => new MarkdownOutput(value)
	}
}

type IO = {
	input: {
		text: (name: string) => Promise<string>
		date: (name: string) => Promise<string>
	}
	output: {
		markdown: (value: string) => Promise<MarkdownOutput>
	}
}

class ActionRunner {
	readonly io: IO
	private inputoutputs: InputOutput[] = []
	readonly name: string
	readonly handler: (io: IO) => Promise<void>

	constructor({ name, handler }: { name: string, handler: (io: IO) => Promise<void> }) {
		if (name === INIT_MODAL_NAME) {
			throw new Error("Action name cannot be the same as the initial modal name")
		}
		this.name = name
		this.io = {
			input: {
				text: async (name: string): Promise<string> => {
					console.log("ADDING TEXT INPUT", name)
					if (this.inputoutputs.find(inputoutput => inputoutput.name === name)) {
						const input = this.inputoutputs.find(inputoutput => inputoutput.name === name) as TextInput
						return await input.getValue()
					}
					const input = new TextInput(name)
					this.inputoutputs.push(input)
					throw new BarbellIOError(`Input ${name} is not set`)
				},
				date: async (name: string): Promise<string> => {
					if (this.inputoutputs.find(inputoutput => inputoutput.name === name)) {
						const input = this.inputoutputs.find(inputoutput => inputoutput.name === name) as DateInput
						return input.getValue()
					}
					const input = new DateInput(name)
					this.inputoutputs.push(input)
					throw new BarbellIOError(`Input ${name} is not set`)
				}
			},
			output: {
				markdown: async (value: string): Promise<MarkdownOutput> => {
					if (this.inputoutputs.find(inputoutput => inputoutput.name === value)) {
						return this.inputoutputs.find(inputoutput => inputoutput.name === value) as MarkdownOutput
					}
					const output = new MarkdownOutput(value)
					this.inputoutputs.push(output)
					return output
				}
			}
		}
		this.handler = handler
	}

	public async run(): Promise<Block[]> {
		console.log("INPUTS", this.inputoutputs)
		await this.handler(this.io).catch(async e => {
			if (e instanceof BarbellIOError) {
				console.error("BarbellIOError:", e.message);
			} else {
				console.error(e);
				throw e
			}
		})
		return (await Promise.all(this.inputoutputs.map(inputoutput => inputoutput.render()))).flat()
	}
}

export class Action {
	readonly name: string
	readonly handler: (io: IO) => Promise<void>

	constructor({ name, handler }: { name: string, handler: (io: IO) => Promise<void> }) {
		this.name = name
		this.handler = handler
	}
	async run(inputs?: Record<string, string>) {
		const actionRunner = new ActionRunner({ name: this.name, handler: this.handler })
		return await actionRunner.run(inputs)
	}
}

export default class Bot {
	private actions: Record<string, Action> = {}
	constructor() { }
	defineAction(action: Action) {
		if (action.name in this.actions) {
			throw new Error(`Duplicate action ${action.name}`)
		}
		this.actions[action.name] = action
	}
	getActions() {
		return this.actions
	}
	getAction(name: string) {
		return this.actions[name]
	}
}