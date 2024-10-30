import { Exception } from "./index.js";

export class EntryClashException extends Exception {
	constructor() {
		super(
			"Já existe apontamento para o momento informado. Verifique horas e data inseridas"
		);
	}
}
