require('dotenv').config();
const path = require('path');

const config = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '1558502201868030012',
  devGuildId: process.env.DEV_GUILD_ID || '',
  port: parseInt(process.env.PORT, 10) || 3000,
  databasePath: process.env.DATABASE_PATH 
    ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
    : path.resolve(process.cwd(), 'data/database.sqlite'),
  defaultColor: 0x5865F2, // Discord Blurple
  successColor: 0x57F287, // Green
  errorColor: 0xED4245,   // Red
  warningColor: 0xFEE75C, // Yellow
  ticketCategoryName: 'TICKETS',
};

// Validate critical config
function validateConfig() {
  const missing = [];
  if (!config.token) missing.push('DISCORD_TOKEN');
  if (!config.clientId) missing.push('CLIENT_ID');
  
  if (missing.length > 0) {
    console.warn(`[WARNING] Thiếu biến môi trường: ${missing.join(', ')}.`);
    console.warn(`[WARNING] Vui lòng cấu hình trong file .env hoặc trên Railway Environment Variables!`);
  }
}

module.exports = {
  config,
  validateConfig
};
