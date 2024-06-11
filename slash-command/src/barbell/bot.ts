import { Block } from "@slack/web-api"

class Input {
	private value: string | number | boolean | undefined
	constructor(private readonly name: string) { }
	setValue(value: string | number | boolean) {
		this.value = value
	}
	getValue() {
		if (!this.value) {
			throw new Error(`Value for ${this.name} is not set`)
		}
		return this.value
	}
}

class TextInput extends Input {
	constructor(name: string) {
		super(name)
	}
}

class DateInput extends Input {
	constructor(name: string) {
		super(name)
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

export const io = {
	input: {
		text: async (name: string) => new TextInput(name),
		date: async (name: string) => new DateInput(name)
	},
	output: {
		markdown: async (value: string) => new MarkdownOutput(value)
	}
}

export class Action {
	private inputs: {
		name: string
		type: "text" | "number" | "select"
		options?: {
			label: string
			value: string
		}[]
	}[] = []
	readonly name: string
	readonly handler: () => Promise<Output>

	constructor({ name, handler }: { name: string, handler: () => Promise<Output> }) {
		this.name = name
		this.handler = handler
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