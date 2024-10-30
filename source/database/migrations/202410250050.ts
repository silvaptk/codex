import { Database } from "better-sqlite3";

export function up(database: Database) {
	database
		.prepare(
			`ALTER TABLE entries ADD COLUMN isFlagged INTEGER NOT NULL DEFAULT 0`
		)
		.run();
}

export function down(database: Database) {
	database.prepare(`ALTER TABLE entries DROP COLUMN isFlagged`).run();
}
