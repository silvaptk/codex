import database from "../../database/index.js";
import { EntryClashException } from "../../domain/exceptions/entries.js";
import {
	Entry,
	EntryDTO,
	EntryMonthlyReport,
	NewEntryDTO,
} from "../../domain/types/entries.js";
import { Tag } from "../../domain/types/tags.js";
import {
	getMinutesFromHours,
	getMonthWorkDaysAmount,
	minutesToHour,
	subtractHours,
} from "../../view/utils/date.js";
import { addToLog } from "../log.js";
import { getHourValue } from "./user.js";

export async function getEntries() {
	const query = `
		SELECT * 
		FROM entries 
		ORDER BY datetime(date || ' ' || startingHour) DESC
	`;

	const dtos = database.prepare<[], EntryDTO>(query).all();

	return await Promise.all<Entry>(
		dtos.map(async (dto) => ({ ...dto, tags: await getEntryTags(dto.id) }))
	);
}

export async function getEntryTags(id: number) {
	const query = `
		SELECT tags.* 
		FROM tags 
			JOIN entryTags ON tags.id = entryTags.tagId 
		WHERE entryTags.entryId = ?
	`;

	return database.prepare<[number], Tag>(query).all(id);
}

export async function addEntry(data: NewEntryDTO) {
	const dataParsed = await getDatabaseReadyEntry(data);

	checkIfEntryCanBeSaved(dataParsed);

	let query = `
		INSERT INTO 
			entries (date, startingHour, endingHour, description, hourValue) 
		VALUES (@date, @startingHour, @endingHour, @description, @hourValue);
	`;

	const { lastInsertRowid: entryId } = database.prepare(query).run(dataParsed);

	await relateEntryToTags(Number(entryId), dataParsed.tagIds);
}

async function relateEntryToTags(entryId: number, tagIds: (string | number)[]) {
	const query = `
		INSERT INTO entryTags (entryId, tagId) VALUES (?, ?)
	`;

	const entryTagsInsertionStatement = database.prepare(query);

	tagIds
		.map(Number)
		.filter(Boolean)
		.forEach((tagId) => {
			return entryTagsInsertionStatement.run(entryId, tagId);
		});
}

async function detachEntryFromAllTags(entryId: number) {
	return database
		.prepare(`DELETE FROM entryTags WHERE entryId = ?`)
		.run(entryId);
}

export async function updateEntry(id: number, data: NewEntryDTO) {
	const dataParsed = await getDatabaseReadyEntry(data);

	checkIfEntryCanBeSaved(dataParsed, id);

	const query = `
		UPDATE entries SET 
			date = @date, 
			startingHour = @startingHour, 
			endingHour = @endingHour, 
			description = @description
		WHERE id = @id
	`;

	database.prepare(query).run({ ...dataParsed, id });

	detachEntryFromAllTags(id);

	relateEntryToTags(id, dataParsed.tagIds);
}

export async function getEntry(id: number): Promise<Entry | null> {
	const dto = database
		.prepare<[number], EntryDTO | null>(`SELECT * FROM entries WHERE id = ?`)
		.get(id);

	if (!dto) {
		return null;
	}

	return {
		...dto,
		tags: await getEntryTags(dto.id),
	};
}

function checkIfEntryCanBeSaved(targetEntry: NewEntryDTO, id?: number) {
	const query = `SELECT * FROM entries WHERE date = ?`;

	const entriesOnSameDay = database
		.prepare<[string], EntryDTO>(query)
		.all(targetEntry.date)
		.filter((entry) => entry.id !== id);

	entriesOnSameDay.forEach((entry) => {
		const entryHoursStart = getMinutesFromHours(entry.startingHour);
		const entryHoursEnd = getMinutesFromHours(entry.endingHour);
		const targetHoursStart = getMinutesFromHours(targetEntry.startingHour);
		const targetHoursEnd = getMinutesFromHours(targetEntry.endingHour);

		const hourIntervalsAreDisjoint = [
			entryHoursEnd < targetHoursStart,
			targetHoursEnd < entryHoursStart,
		].some(Boolean);

		if (!hourIntervalsAreDisjoint) {
			throw new EntryClashException();
		}
	});
}

async function getDatabaseReadyEntry(entry: NewEntryDTO) {
	let dateParsed: string;

	if (entry.date.includes("/")) {
		dateParsed = entry.date.split("/").reverse().join("-");
	} else {
		dateParsed = entry.date;
	}

	return {
		...entry,
		date: dateParsed,
		hourValue: await getHourValue(),
	};
}

export async function removeEntry(id: number) {
	return database.prepare<[number]>(`DELETE FROM entries WHERE id = ?`).run(id);
}

export async function getEntryMonthlyReports() {
	const monthlyReports: Record<string, EntryMonthlyReport> = {};

	const PAGE_SIZE = 1000;

	const result = database
		.prepare<[], { amount: number }>(`SELECT COUNT(*) AS amount FROM entries`)
		.get();

	if (!result) {
		return [];
	}

	const entriesAmount = result.amount;

	const statement = database.prepare<[number, number], EntryDTO>(
		`SELECT * FROM entries LIMIT ? OFFSET ?`
	);

	const pagesAmount = Math.ceil(entriesAmount / PAGE_SIZE);

	for (let page = 0; page < pagesAmount; page++) {
		const entries = statement.all(PAGE_SIZE, page * PAGE_SIZE);

		entries.forEach((entry) => {
			const date = new Date(`${entry.date} 12:00`);

			const month = [date.getFullYear(), date.getMonth() + 1]
				.map((slice) => slice.toString().padStart(2, "0"))
				.join("-");

			const entryDurationAsMinutes = subtractHours(
				entry.endingHour,
				entry.startingHour
			);
			const entryValue = (entryDurationAsMinutes / 60) * entry.hourValue;
			const entryDay = new Date(entry.date).getDate();

			if (monthlyReports[month]) {
				const reportDurationAsMinutes = getMinutesFromHours(
					monthlyReports[month].hours
				);
				monthlyReports[month].hours = minutesToHour(
					reportDurationAsMinutes + entryDurationAsMinutes
				);

				monthlyReports[month].value += entryValue;
				monthlyReports[month].workDaysDone = Array.from(
					new Set(monthlyReports[month].workDaysDone).add(entryDay)
				);
			} else {
				monthlyReports[month] = {
					hours: minutesToHour(entryDurationAsMinutes),
					month,
					value: entryValue,
					workDaysDone: [new Date(entry.date).getDate()],
					workDaysAmount: getMonthWorkDaysAmount(month),
				};
			}
		});
	}

	addToLog(Object.values(monthlyReports).at(-1));

	return Object.values(monthlyReports);
}

export async function getEntriesOfTheDay() {
	const query = `
		SELECT * 
		FROM entries 
		WHERE date = ?
		ORDER BY datetime(date || ' ' || startingHour) DESC
	`;

	const now = new Date();
	const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
		.map((slice) => slice.toString().padStart(2, "0"))
		.join("-");

	const dtos = database.prepare<[string], EntryDTO>(query).all(today);

	return await Promise.all<Entry>(
		dtos.map(async (dto) => ({ ...dto, tags: await getEntryTags(dto.id) }))
	);
}

export async function getLastEntry() {
	const query = `
		SELECT * 
		FROM entries 
		ORDER BY datetime(date || ' ' || startingHour) DESC
		LIMIT 1
	`;

	const dto = database.prepare<[], EntryDTO>(query).get();

	if (!dto) {
		return null;
	}

	return { ...dto, tags: await getEntryTags(dto.id) };
}

export async function toggleEntryFlag(id: number) {
	const entry = await getEntry(id);

	if (!entry) {
		return;
	}

	return database
		.prepare(`UPDATE entries SET isFlagged = ? WHERE id = ?`)
		.run(entry.isFlagged ? 0 : 1, id);
}
