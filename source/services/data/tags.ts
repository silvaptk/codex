import database from "../../database/index.js";
import { NewTagDTO, Tag, TagReport } from "../../domain/types/tags.js";

export async function getTags() {
	return database.prepare<[], Tag>(`SELECT * FROM tags`).all();
}

export async function updateTag(data: Tag) {
	database
		.prepare(`UPDATE tags SET name = ?, content = ? WHERE id = ?`)
		.run(data.name, data.content || null, data.id);
}

export async function addTag(data: NewTagDTO) {
	database
		.prepare(`INSERT INTO tags (name, content) VALUES (@name, @content)`)
		.run(data);
}

export async function getTagReports() {
	const query = `
		SELECT 
			tags.*, 
			COUNT(entries.id) AS entries, 
			IFNULL(
        SUM(	
          strftime('%H', entries.endingHour) * 60 + strftime('%M', entries.endingHour) - 
          strftime('%H', entries.startingHour) * 60 - strftime('%M', entries.startingHour)
        ) / 60.0, 
        0
    	) AS hours
		FROM tags 
			LEFT JOIN entryTags ON tags.id = entryTags.tagId 
			LEFT JOIN entries ON entryTags.entryId = entries.id
		GROUP BY tags.id, tags.name, tags.content;
	`;

	return database.prepare<[], TagReport>(query).all();
}

export async function removeTag(id: number) {
	return database.prepare<[number]>(`DELETE FROM tags WHERE id = ?`).run(id);
}
