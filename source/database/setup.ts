import database from "./index.js";

export default function setupDatabase() {
	database.exec(`
		PRAGMA foreign_keys = ON;

		CREATE TABLE IF NOT EXISTS tags (
			id INTEGER PRIMARY KEY NOT NULL,
			name TEXT NOT NULL,
			content TEXT NOT NULL
		);
		
		CREATE TABLE IF NOT EXISTS entries (
			id INTEGER PRIMARY KEY NOT NULL,
			startingHour TEXT NOT NULL,
			endingHour TEXT NOT NULL,
			date TEXT NOT NULL,
			description TEXT NOT NULL,
			hourValue REAL NOT NULL
		);

		CREATE TABLE IF NOT EXISTS entryTags (	
			id INTEGER PRIMARY KEY NOT NULL,
			entryId INTEGER NOT NULL,
			tagId INTEGER NOT NULL,

			CONSTRAINT tagFk FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE SET NULL
			CONSTRAINT entryFk FOREIGN KEY (entryId) REFERENCES entries(id) ON DELETE CASCADE
		);
	`);
}
