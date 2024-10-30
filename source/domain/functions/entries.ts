import { Entry } from "../types/entries.js";

export function getEntryDescription(entry: Entry) {
	if (!entry.description) {
		return undefined;
	}

	let description = entry.description;

	entry.tags.forEach((tag, index) => {
		if (!tag.content) {
			return;
		}

		const tagPlaceholder = `@${index + 1}`;

		description = description.replace(tagPlaceholder, tag.content);
	});

	return description;
}
