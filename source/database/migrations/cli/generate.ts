import path from "path";
import fileSystem from "fs";

export default function generate() {
	const migrationsDirectoryPath = path.join(
		process.cwd(),
		"source",
		"database",
		"migrations"
	);

	const fileName = [
		new Date().getFullYear(),
		new Date().getMonth() + 1,
		new Date().getDate(),
		new Date().getHours(),
		new Date().getMinutes(),
		".ts",
	]
		.map((value) => value.toString().padStart(2, "0"))
		.join("");

	const filePath = path.join(migrationsDirectoryPath, fileName);

	fileSystem.writeFileSync(filePath, migrationTemplate.trim());
}

const migrationTemplate = `
import { Database } from "better-sqlite3";

export function up(database: Database) {}

export function down(database: Database) {}
`;
