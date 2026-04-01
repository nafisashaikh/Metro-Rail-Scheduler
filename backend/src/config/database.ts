import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve(__dirname, '../../metro.db');

let db: DatabaseSync;

export function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    initSchema(db);
  }
  return db;
}

function initSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','supervisor','employee')),
      employee_id TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS passengers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      card_number TEXT,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      network_type TEXT NOT NULL,
      operational_status TEXT NOT NULL,
      total_length TEXT,
      description TEXT,
      section TEXT NOT NULL CHECK (section IN ('metro','railway'))
    );

    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      line_id TEXT NOT NULL REFERENCES lines(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      station_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('medical','technical','security','weather','delay')),
      severity TEXT NOT NULL CHECK (severity IN ('info','warning','critical')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      station TEXT NOT NULL,
      next_station TEXT,
      train_id TEXT,
      section TEXT NOT NULL CHECK (section IN ('metro','railway')),
      timestamp INTEGER NOT NULL,
      resolved INTEGER NOT NULL DEFAULT 0,
      journey_continued INTEGER
    );
  `);
}
