import { Block } from "@slack/web-api"
import { BarbellIOError } from "../types/ioError"

abstract class InputOutput {
	constructor(readonly name: string) { }
	abstract render(): Block[]
}

abstract class Input extends InputOutput {
	protected value: string | number | boolean | undefined
	constructor(readonly name: string) {
		super(name)
	}
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
		text: (name: string) => Promise<TextInput>
		date: (name: string) => Promise<DateInput>
	}
	output: {
		markdown: (value: string) => Promise<MarkdownOutput>
	}
}

export class Action {
	readonly io: IO
	private inputoutputs: InputOutput[] = []
	readonly name: string
	readonly handler: (io: IO) => Promise<void>

	constructor({ name, handler }: { name: string, handler: (io: IO) => Promise<void> }) {
		this.name = name
		this.io = {
			input: {
				text: async (name: string): Promise<TextInput> => {
					console.log("ADDING TEXT INPUT", name)
					if (this.inputoutputs.find(inputoutput => inputoutput.name === name)) {
						return this.inputoutputs.find(inputoutput => inputoutput.name === name) as TextInput
					}
					const input = new TextInput(name)
					this.inputoutputs.push(input)
					return input
				},
				date: async (name: string): Promise<DateInput> => {
					if (this.inputoutputs.find(inputoutput => inputoutput.name === name)) {
						return this.inputoutputs.find(inputoutput => inputoutput.name === name) as DateInput
					}
					const input = new DateInput(name)
					this.inputoutputs.push(input)
					return input
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
				return await this.io.output.markdown(e.message)
			} else {
				console.error(e);
				return await this.io.output.markdown(e.message)
			}
		})
		return (await Promise.all(this.inputoutputs.map(inputoutput => inputoutput.render()))).flat()
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