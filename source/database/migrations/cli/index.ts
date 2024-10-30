import generate from "./generate.js";
import run from "./run.js";

const command = process.argv[2];

if (!command) {
	console.error(`Migrations: No command provided! Please use "generate", "migrate" or "rollback"`);
	process.exit(1);
}

switch (command) {
	case "migrate":
		run("migrate");
		break;
	case "rollback":
		run("rollback");
		break;
	case "generate":
		generate();
		break;
	default:
		console.error(
			`Migrations: Invalid command "${command}"! Please use "generate", "migrate" or "rollback"`
		);
}
