import fileSystem from "fs";
import path from "path";

import database from "../../index.js";
import { MigrationDTO, MigrationStatus } from "./types.js";

export function insertMigration(migrationId: string) {
	database
		.prepare<[string, MigrationStatus]>(
			`INSERT INTO migrations (id, status) VALUES (?, ?)`
		)
		.run(migrationId, MigrationStatus.NEW);
}

export function getMigrationStatus(id: string) {
	const dto = database
		.prepare<string, MigrationDTO>(`SELECT * FROM migrations WHERE id = ?`)
		.get(id);

	return dto?.status;
}

function createMigrationsTable() {
	let query = `
		CREATE TABLE IF NOT EXISTS migrations (
			id TEXT PRIMARY KEY NOT NULL,
			status TEXT NOT NULL
		)	
	`;

	database.prepare(query).run();
}

export async function getMigrations() {
	const migrationsDirectoryPath = path.join(
		process.cwd(),
		"dist",
		"database",
		"migrations"
	);

	const migrationFilenames = fileSystem
		.readdirSync(migrationsDirectoryPath)
		.filter((filename) => {
			return /^\d+\.js$/g.test(filename);
		});

	const migrations = migrationFilenames.map((filename) => {
		const id = filename.replace(/\D/g, "");

		const migrationFilePath = path.join(migrationsDirectoryPath, filename);

		return {
			id,
			actions: import(migrationFilePath),
		};
	});

	createMigrationsTable();

	return await Promise.all(
		migrations.map(async (migration) => {
			const status = getMigrationStatus(migration.id);

			if (!status) {
				insertMigration(migration.id);
			}

			return {
				status,
				id: migration.id,
				actions: await migration.actions,
			};
		})
	);
}

export function updateMigrationStatus(
	migrationId: string,
	status: MigrationStatus
) {
	database
		.prepare<[string, string]>(`UPDATE migrations SET status = ? WHERE id = ?`)
		.run(status, migrationId);
}
