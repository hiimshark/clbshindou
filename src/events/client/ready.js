const { ActivityType } = require('discord.js');
const logger = require('../../utils/logger');
const { deploySlashCommands } = require('../../scripts/deployCommands');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    logger.success(`====================================================`);
    logger.success(`Bot đã đăng nhập thành công: ${client.user.tag}`);
    logger.success(`ID: ${client.user.id}`);
    logger.success(`Đang phục vụ ${client.guilds.cache.size} máy chủ.`);
    logger.success(`====================================================`);

    // Set bot presence
    client.user.setPresence({
      activities: [{ name: 'Nối từ & Phát nhạc | 24/7 Railway', type: ActivityType.Playing }],
      status: 'online'
    });

    // Auto deploy slash commands tức thì cho các máy chủ
    try {
      await deploySlashCommands(client);
    } catch (err) {
      logger.error('Lỗi tự động đăng ký lệnh khi sẵn sàng:', err.message);
    }
  }
};
