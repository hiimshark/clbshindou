const http = require('http');
const { config, validateConfig } = require('./config');
const logger = require('./utils/logger');
const { initDatabase } = require('./database/db');
const vietnameseDict = require('./utils/vietnameseDict');
const { createDiscordClient } = require('./client');
const { initMusic } = require('./handlers/musicHandler');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

// 1. Kiểm tra cấu hình môi trường
validateConfig();

// 2. Khởi tạo Cơ sở dữ liệu SQLite
try {
  initDatabase();
} catch (err) {
  logger.error('Không thể khởi tạo cơ sở dữ liệu SQLite:', err);
  process.exit(1);
}

// 3. Nạp trước từ điển tiếng Việt vào bộ nhớ RAM
vietnameseDict.init();

// 4. Khởi tạo Discord Client
const client = createDiscordClient();

// 5. Khởi tạo hệ thống Âm nhạc DisTube
initMusic(client);

// 6. Nạp toàn bộ Slash Commands và Events
loadCommands(client);
loadEvents(client);

// 7. Mini HTTP Healthcheck Server (Phục vụ treo 24/24 trên Railway & Uptime Monitoring)
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/health' || req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      service: 'Discord Bot Railway 24/7',
      botTag: client.user ? client.user.tag : 'Connecting...',
      uptimeSeconds: Math.floor(process.uptime()),
      guilds: client.guilds ? client.guilds.cache.size : 0,
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(config.port, () => {
  logger.info(`Healthcheck HTTP Server đang lắng nghe tại cổng ${config.port} (Treo 24/24 trên Railway)`);
});

// 8. Đăng nhập Discord Bot
if (config.token) {
  client.login(config.token).catch(err => {
    logger.error('Đăng nhập Discord thất bại! Kiểm tra lại DISCORD_TOKEN trong .env:', err.message);
  });
} else {
  logger.warn('Chưa cấu hình DISCORD_TOKEN. Bot đang chờ điền token để kết nối Discord Gateway.');
}

// 9. Phòng chống Crash toàn cục (Tối ưu tính ổn định 24/7)
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection tại:', promise, 'lý do:', reason);
});

process.on('uncaughtException', (err, origin) => {
  logger.error(`Uncaught Exception: ${err.message} (${origin})`);
});
