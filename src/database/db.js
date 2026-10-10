const path = require('path');
const fs = require('fs');
const { config } = require('../config');
const logger = require('../utils/logger');

let db = null;
let useJsonFallback = false;
let jsonStore = { guild_configs: {}, tickets: {} };
let jsonFilePath = '';

function initDatabase() {
  if (db) return db;

  // Make sure directory exists
  try {
    const dir = path.dirname(config.databasePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    logger.warn('Không thể tạo thư mục database theo DATABASE_PATH, dùng thư mục cục bộ:', err.message);
  }

  // Thử kết nối better-sqlite3
  try {
    const Database = require('better-sqlite3');
    db = new Database(config.databasePath);
    db.pragma('journal_mode = WAL');

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
  } catch (err) {
    logger.warn(`Không thể nạp better-sqlite3 native addon (${err.message}). Tự động chuyển sang chế độ lưu trữ JSON an toàn!`);
    useJsonFallback = true;

    jsonFilePath = config.databasePath.replace(/\.sqlite$/, '.json');
    if (!jsonFilePath.endsWith('.json')) jsonFilePath += '.json';

    try {
      const dir = path.dirname(jsonFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (fs.existsSync(jsonFilePath)) {
        jsonStore = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
      } else {
        saveJsonStore();
      }
      logger.info(`Đã khởi tạo lưu trữ JSON dự phòng tại: ${jsonFilePath}`);
    } catch (fsErr) {
      logger.error('Lỗi khi nạp file JSON dự phòng:', fsErr.message);
    }
    return null;
  }
}

function saveJsonStore() {
  if (!useJsonFallback || !jsonFilePath) return;
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonStore, null, 2), 'utf-8');
  } catch (err) {
    logger.error('Lỗi lưu JSON store:', err.message);
  }
}

function getDatabase() {
  if (!db && !useJsonFallback) {
    initDatabase();
  }
  return db;
}

function isJsonFallback() {
  return useJsonFallback;
}

function getJsonStore() {
  return jsonStore;
}

module.exports = {
  initDatabase,
  getDatabase,
  isJsonFallback,
  getJsonStore,
  saveJsonStore
};
