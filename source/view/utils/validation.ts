export function validateHour(value?: string) {
	if (!value?.trim()) {
		return "";
	}

	const pattern = /^[0-2]\d:\d{2}$/g;

	try {
		if (!pattern.test(value)) {
			throw new Error();
		}

		const [hours, minutes] = value.split(":").map(Number);

		if (hours === undefined || minutes === undefined) {
			throw new Error();
		}

		if (hours > 23 || minutes > 59) {
			throw new Error();
		}
	} catch {
		return "Insira uma hora válida (00:00 a 23:59)";
	}

	return "";
}

export function validateDate(value?: string) {
	if (!value?.trim()) {
		return "A data é obrigatória";
	}

	const pattern = /^\d{2}\/\d{2}\/\d{4}$/g;

	if (!pattern.test(value.trim())) {
		return "Insira uma data válida (ex.: 01/01/2024)";
	}

	const [day, month, year] = value.split("/").map(Number);

	if (!day || !month || !year) {
		return "Insira uma data válida (ex.: 01/01/2024)";
	}

	const date = new Date(year, month - 1, day);

	const dateDoesNotExist = [
		date.getDate() !== day,
		date.getMonth() !== month - 1,
		date.getFullYear() !== year,
	].some(Boolean);

	if (dateDoesNotExist) {
		return "A data inserida não existe";
	}

	return "";
}
