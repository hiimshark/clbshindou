const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { config } = require('../config');
const logger = require('../utils/logger');

let db = null;

function initDatabase() {
  if (db) return db;

  // Make sure directory exists
  const dir = path.dirname(config.databasePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(config.databasePath);
  // Enable Write-Ahead Logging for speed & concurrency
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS guild_configs (
      guild_id TEXT PRIMARY KEY,
      welcome_channel_id TEXT,
      welcome_message TEXT,
      goodbye_channel_id TEXT,
      goodbye_message TEXT,
      autorole_id TEXT,
      ticket_category_id TEXT,
      ticket_log_channel_id TEXT,
      ticket_staff_role_id TEXT,
      noitu_channel_id TEXT,
      noitu_streak INTEGER DEFAULT 0,
      noitu_max_streak INTEGER DEFAULT 0,
      noitu_last_word TEXT,
      noitu_last_user_id TEXT,
      noitu_used_words TEXT DEFAULT '[]',
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS tickets (
      channel_id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      reason TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      closed_at INTEGER
    );
  `);

  logger.info(`SQLite Database đã khởi tạo thành công tại: ${config.databasePath}`);
  return db;
}

function getDatabase() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

module.exports = {
  initDatabase,
  getDatabase
};
