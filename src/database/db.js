const path = require('path');
const fs = require('fs');
const { config } = require('../config');
const logger = require('../utils/logger');

let jsonStore = { guild_configs: {}, tickets: {} };
let jsonFilePath = '';
let initialized = false;

function initDatabase() {
  if (initialized) return jsonStore;

  jsonFilePath = config.databasePath.replace(/\.sqlite$/, '.json');
  if (!jsonFilePath.endsWith('.json')) jsonFilePath += '.json';

  try {
    const dir = path.dirname(jsonFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(jsonFilePath)) {
      const data = fs.readFileSync(jsonFilePath, 'utf-8');
      jsonStore = JSON.parse(data);
      if (!jsonStore.guild_configs) jsonStore.guild_configs = {};
      if (!jsonStore.tickets) jsonStore.tickets = {};
    } else {
      saveJsonStore();
    }

    initialized = true;
    logger.info(`Cơ sở dữ liệu an toàn (Zero-Crash JSON) đã khởi tạo tại: ${jsonFilePath}`);
  } catch (err) {
    logger.error('Lỗi khởi tạo database JSON:', err.message);
  }

  return jsonStore;
}

function saveJsonStore() {
  if (!jsonFilePath) return;
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonStore, null, 2), 'utf-8');
  } catch (err) {
    logger.error('Lỗi khi lưu dữ liệu database JSON:', err.message);
  }
}

function isJsonFallback() {
  return true;
}

function getDatabase() {
  return null;
}

function getJsonStore() {
  if (!initialized) initDatabase();
  return jsonStore;
}

module.exports = {
  initDatabase,
  getDatabase,
  isJsonFallback,
  getJsonStore,
  saveJsonStore
};
