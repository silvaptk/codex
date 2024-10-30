import database from "../../index.js";
import { getMigrations, updateMigrationStatus } from "./lib.js";
import { MigrationStatus } from "./types.js";

export default async function run(command: "migrate" | "rollback") {
	const migrations = await getMigrations();

	const targetStatus = {
		migrate: MigrationStatus.NEW,
		rollback: MigrationStatus.EXECUTED,
	}[command];

	const targetMigrations = migrations.filter(
		(migration) => migration.status === targetStatus
	);

	targetMigrations.forEach((migration) => {
		database.prepare(`BEGIN`).run();

		try {
			migration.actions[command === "migrate" ? "up" : "down"](database);

			updateMigrationStatus(
				migration.id,
				command === "migrate" ? MigrationStatus.EXECUTED : MigrationStatus.NEW
			);

			database.prepare(`COMMIT`).run();
		} catch (error) {
			database.prepare(`ROLLBACK`).run();

			console.error(
				`Migrations: Error while executing migration "${migration.id}"`
			);
			console.error(error);

			process.exit(1);
		}
	});
}
