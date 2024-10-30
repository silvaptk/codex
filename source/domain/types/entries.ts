import { Tag } from "./tags.js";

export interface NewEntryDTO {
	date: string;
	startingHour: string;
	endingHour: string;
	description?: string;
	tagIds: string[];
}

export interface EntryDTO extends Omit<NewEntryDTO, "tagIds"> {
	id: number;
	hourValue: number;
	isFlagged: boolean;
}

export interface Entry extends EntryDTO {
	tags: Tag[];
}

export interface EntryMonthlyReport {
	month: string;
	hours: string;
	value: number;
	workDaysDone: number[];
	workDaysAmount: number;
}
