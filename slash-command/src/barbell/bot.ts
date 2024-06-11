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
	abstract render(): string
}

class MarkdownOutput extends Output {
	constructor(private readonly value: string) {
		super()
	}
	render() {
		return this.value
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
	private readonly name: string
	private readonly handler: () => Promise<Output>

	constructor({ name, handler }: { name: string, handler: () => Promise<Output> }) {
		this.name = name
		this.handler = handler
	}
}

export default class Bot {
	private actions: Action[] = []
	constructor() { }
	defineAction(action: Action) {
		this.actions.push(action)
	}
	getActions() {
		return this.actions
	}
}