// Đặt bộ bắt lỗi toàn cục lên ĐẦU TIÊN để không bỏ sót bất kỳ lỗi khởi động nào
process.on('uncaughtException', (err, origin) => {
  console.error(`[FATAL] Uncaught Exception:`, err.stack || err.message, `(${origin})`);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection:', reason);
});

const http = require('http');
const { config, validateConfig } = require('./config');
const logger = require('./utils/logger');
const { initDatabase } = require('./database/db');
const vietnameseDict = require('./utils/vietnameseDict');
const { createDiscordClient } = require('./client');
const { initMusic } = require('./handlers/musicHandler');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');

logger.info('Đang khởi động bot trên môi trường:', process.env.NODE_ENV || 'development');

// 1. Kiểm tra cấu hình môi trường
validateConfig();

// 2. Khởi tạo Cơ sở dữ liệu
try {
  initDatabase();
} catch (err) {
  logger.error('Lỗi khởi tạo cơ sở dữ liệu:', err);
}

// 3. Nạp trước từ điển tiếng Việt
try {
  vietnameseDict.init();
} catch (err) {
  logger.warn('Lỗi khi nạp từ điển:', err.message);
}

// 4. Khởi tạo Discord Client
const client = createDiscordClient();

// 5. Khởi tạo hệ thống Âm nhạc DisTube
try {
  initMusic(client);
} catch (err) {
  logger.error('Lỗi khởi tạo DisTube:', err);
}

// 6. Nạp toàn bộ Slash Commands và Events
loadCommands(client);
loadEvents(client);

// 7. Mini HTTP Healthcheck Server (Bắt buộc bind vào 0.0.0.0 cho Docker Container Railway)
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

const listenPort = config.port;
server.listen(listenPort, '0.0.0.0', () => {
  logger.info(`Healthcheck HTTP Server đang lắng nghe tại 0.0.0.0:${listenPort} (Railway 24/7)`);
});

// 8. Đăng nhập Discord Bot
if (config.token) {
  client.login(config.token).catch(err => {
    logger.error('Đăng nhập Discord thất bại! Kiểm tra DISCORD_TOKEN và Privileged Intents:', err.message);
  });
} else {
  logger.warn('Chưa cấu hình DISCORD_TOKEN. Bot đang chờ điền token để kết nối Discord Gateway.');
}
