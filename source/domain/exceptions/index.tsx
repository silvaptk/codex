export abstract class Exception {
	constructor(private message: string) {}

	getMessage() {
		return this.message;
	}
}
