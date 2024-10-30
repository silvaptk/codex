import fileSystem from "fs/promises";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "codex.log");

export async function addToLog(text: any, tag?: string) {
	try {
		await fileSystem.readFile(FILE_PATH);

		fileSystem.appendFile(FILE_PATH, "\n");
	} catch {}

	fileSystem.appendFile(
		FILE_PATH,
		`[${new Date().toISOString()}][${tag || "DEFAULT"}] :: ${JSON.stringify(
			text
		)}`
	);
}

export async function clearLog() {
	fileSystem.writeFile(FILE_PATH, "");
}
