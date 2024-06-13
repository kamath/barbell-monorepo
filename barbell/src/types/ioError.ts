export class BarbellIOError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "BarbellIOError";
	}
}
