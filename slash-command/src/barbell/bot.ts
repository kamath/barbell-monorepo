import { Block } from "@slack/web-api"
import { BarbellIOError } from "../types/ioError"

abstract class Input {
	protected value: string | number | boolean | undefined
	constructor(readonly name: string) { }
	setValue(value: string | number | boolean) {
		this.value = value
	}
	getValue() {
		if (!this.value) {
			throw new BarbellIOError(`Value for ${this.name} is not set`)
		}
		return this.value
	}
	abstract render(): Block[]
}

class TextInput extends Input {
	constructor(name: string) {
		super(name)
	}
	render() {
		return [
			{
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
			},
		]
	}
}

class DateInput extends Input {
	constructor(name: string) {
		super(name)
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
}

abstract class Output {
	abstract render(): Block[]
}

class MarkdownOutput extends Output {
	constructor(private readonly value: string) {
		super()
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
		text: (name: string) => TextInput
		date: (name: string) => DateInput
	}
	output: {
		markdown: (value: string) => MarkdownOutput
	}
}

export class Action {
	readonly io: IO
	private inputs: Input[] = []
	readonly name: string
	readonly handler: (io: IO) => Promise<Output>

	constructor({ name, handler }: { name: string, handler: (io: IO) => Promise<Output> }) {
		this.name = name
		this.io = {
			input: {
				text: (name: string): TextInput => {
					console.log("ADDING TEXT INPUT", name)
					if (this.inputs.find(input => input.name === name)) {
						return this.inputs.find(input => input.name === name) as TextInput
					}
					const input = new TextInput(name)
					this.inputs.push(input)
					return input
				},
				date: (name: string): DateInput => {
					if (this.inputs.find(input => input.name === name)) {
						return this.inputs.find(input => input.name === name) as DateInput
					}
					const input = new DateInput(name)
					this.inputs.push(input)
					return input
				}
			},
			output: {
				markdown: (value: string) => new MarkdownOutput(value)
			}
		}
		this.handler = handler
	}

	public async run(): Promise<Block[]> {
		console.log("INPUTS", this.inputs)
		return [...this.inputs.map(input => input.render()), ...(await this.handler(this.io)).render()].flat()
	}
}

export default class Bot {
	private actions: Record<string, Action> = {}
	constructor() { }
	defineAction(action: Action) {
		if (this.actions[action.name]) {
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