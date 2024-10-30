import { EntryMonthlyReport } from "../../../domain/types/entries.js";
import {
	getMinutesFromHours,
	minutesToHour,
	subtractHours,
} from "../../utils/date.js";

export function parseMonthlyEntryReport(
	report: EntryMonthlyReport,
	hourValue: number,
	hoursGoal: number
) {
	const workDaysLeft = report.workDaysAmount - report.workDaysDone.length;

	const remainingHours = minutesToHour(
		Math.max(subtractHours(`${hoursGoal}:00`, report.hours), 0)
	);

	const hoursMean = minutesToHour(
		Math.round(getMinutesFromHours(report.hours) / report.workDaysDone.length)
	);

	const parsedHoursGoal = `${hoursGoal}:00`;

	let goalHoursMean = "00:00";

	if (workDaysLeft) {
		goalHoursMean = minutesToHour(
			Math.ceil(
				Math.max(subtractHours(parsedHoursGoal, report.hours), 0) / workDaysLeft
			)
		);
	}

	const meanMoney =
		(getMinutesFromHours(report.hours) * hourValue) /
		(report.workDaysDone.length * 60);

	return {
		month: report.month,
		hours: {
			done: report.hours,
			goal: hoursGoal,
			remaining: remainingHours,
			mean: hoursMean,
			goalMean: goalHoursMean,
		},
		money: {
			accumulated: report.value,
			goal: hoursGoal * hourValue,
			mean: meanMoney,
		},
		days: {
			done: report.workDaysDone.length,
			remaining: report.workDaysAmount - report.workDaysDone.length,
			total: report.workDaysAmount,
		},
	};
}
