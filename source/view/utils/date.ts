import isWorkingDay from "@lfreneda/eh-dia-util";

import { capitalize } from "./misc.js";

export default function dateBuilder(
	day?: number,
	month?: number,
	year?: number
) {
	const result = new Date();

	result.setDate(day || result.getDate());
	result.setMonth(month || result.getMonth());
	result.setFullYear(year || result.getFullYear());

	return result;
}

export function formatMonth(encodedMonth: string) {
	const [year, month] = encodedMonth.split("-").map(Number);

	if (!year || !month) {
		return "";
	}

	const monthLabels = "jan,fev,mar,abr,mai,jun,jul,ago,set,out,nov,dez";

	const targetMonthLabel = monthLabels.split(",")[month - 1]!;

	return `${capitalize(targetMonthLabel)}. ${year}`;
}

export function formatDate(date: Date) {
	return [date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear()]
		.map((slice) => slice.toString().padStart(2, "0"))
		.join("/");
}

export function formatHours(date: Date) {
	return [date.getHours(), date.getMinutes()]
		.map((slice) => slice.toString().padStart(2, "0"))
		.join(":");
}

export function getMinutesFromHours(hours: string) {
	return Number(hours.split(":")[0]) * 60 + Number(hours.split(":")[1]);
}

export function subtractHours(firstHours: string, secondHours: string) {
	const firstHoursAsMinutes = getMinutesFromHours(firstHours);
	const secondHoursAsMinutes = getMinutesFromHours(secondHours);

	return firstHoursAsMinutes - secondHoursAsMinutes;
}

export function minutesToHour(minutes: number) {
	return [Math.floor(minutes / 60), minutes % 60]
		.map((slice) => slice.toString().padStart(2, "0"))
		.join(":");
}

export function getMonthWorkDaysAmount(encodedMonth: string) {
	const [year, month] = encodedMonth.split("-").map(Number);

	let result = 0;

	if (!year || !month) {
		return result;
	}

	for (
		let date = new Date(year, month - 1, 1);
		date.getMonth() === month - 1;
		date.setDate(date.getDate() + 1)
	) {
		const encodedDate = [
			date.getFullYear(),
			date.getMonth() + 1,
			date.getDate(),
		]
			.map((slice) => slice.toString().padStart(2, "0"))
			.join("-");

		result += isWorkingDay(encodedDate) ? 1 : 0;
	}

	return result;
}

export function addHours(firstHours: string, secondHours: string) {
	const firstHoursAsMinutes = getMinutesFromHours(firstHours);
	const secondHoursAsMinutes = getMinutesFromHours(secondHours);

	return firstHoursAsMinutes + secondHoursAsMinutes;
}
