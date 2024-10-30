import sql, { Database } from "better-sqlite3";

const database: Database = sql("codex.db");

export default database;
