/**
 * config/database.js
 *
 * Owns the raw SQLite connection and schema creation.
 *
 * Uses Node's built-in `node:sqlite` module (DatabaseSync) rather than a
 * third-party native addon. This avoids requiring a C++ build toolchain
 * (Visual Studio Build Tools on Windows, Xcode CLT on macOS, etc.) on the
 * machine running the app - `npm install` never needs to compile anything
 * for the database layer. Requires Node.js 22.5+.
 *
 * IMPORTANT: This module is only ever imported by repositories/ (which are
 * in turn only used by services/metadata/SQLiteMetadataService). Nothing
 * else in the app is allowed to import this file directly. This keeps the
 * SQL storage detail fully isolated so it can be swapped for DynamoDB
 * later without touching controllers or business logic.
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const { PATHS } = require('./constants');

// Ensure the database directory exists.
const dbDir = path.dirname(PATHS.DATABASE_FILE);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(PATHS.DATABASE_FILE);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

/**
 * Creates all tables if they do not already exist.
 * Safe to call on every server start.
 */
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL UNIQUE,
      file_type TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      download_count INTEGER NOT NULL DEFAULT 0,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_files_user_id ON files (user_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);`);
}

module.exports = { db, initSchema };

/**
 * Creates all tables if they do not already exist.
 * Safe to call on every server start.
 */
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL UNIQUE,
      file_type TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      download_count INTEGER NOT NULL DEFAULT 0,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  db.exec(`CREATE INDEX IF NOT EXISTS idx_files_user_id ON files (user_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);`);
}

module.exports = { db, initSchema };
