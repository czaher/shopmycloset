import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "closet.db");

function getDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  return db;
}

let _db: ReturnType<typeof getDb> | null = null;

export function db() {
  if (!_db) {
    _db = getDb();
    migrate(_db);
  }
  return _db;
}

function migrate(database: ReturnType<typeof getDb>) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      size TEXT,
      category TEXT,
      image_path TEXT,
      status TEXT NOT NULL DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES items(id),
      claimer_name TEXT NOT NULL,
      contact_info TEXT NOT NULL,
      claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export type Item = {
  id: number;
  name: string;
  description: string | null;
  size: string | null;
  category: string | null;
  image_path: string | null;
  status: "available" | "reserved";
  created_at: string;
};

export type Claim = {
  id: number;
  item_id: number;
  claimer_name: string;
  contact_info: string;
  claimed_at: string;
};
