import { Database } from "better-sqlite3";

export function up(database: Database) {
	database
		.prepare(
			`ALTER TABLE entries ADD COLUMN hourValue REAL NOT NULL DEFAULT ${DEFAULT_HOUR_VALUE}`
		)
		.run();
}

export function down(database: Database) {
	database.prepare(`ALTER TABLE entries DROP COLUMN hourValue`).run();
}

const DEFAULT_HOUR_VALUE = 38;
