export function capitalize(text: string) {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatAsCurrency(value: number) {
	const formatter = new Intl.NumberFormat("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	return formatter.format(value);
}

export function formatNumber(value: number) {
	const formatter = new Intl.NumberFormat("pt-BR");

	return formatter.format(value);
}
