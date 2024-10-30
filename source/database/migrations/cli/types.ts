import { Database } from "better-sqlite3";

export enum MigrationStatus {
	NEW = "NEW",
	EXECUTED = "EXECUTED",
}

export interface MigrationDTO {
	id: string;
	status: MigrationStatus;
}

export interface Migration extends MigrationDTO {
	actions: any;
}

export interface MigrationActions {
	up: (database: Database) => void;
	down: (database: Database) => void;
}
