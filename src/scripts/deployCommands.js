const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { config } = require('../config');
const logger = require('../utils/logger');

async function deploySlashCommands(client = null) {
  if (!config.token || !config.clientId) {
    logger.warn('Chưa có DISCORD_TOKEN hoặc CLIENT_ID. Bỏ qua việc tự động đăng ký Slash Commands.');
    return;
  }

  const commands = [];
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFolders = fs.readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      }
    }
  }

  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    logger.info(`Đang đồng bộ ${commands.length} application (/) commands...`);

    // 1. Đăng ký duy nhất danh sách Global commands
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );
    logger.success(`✅ Đã đăng ký thành công ${commands.length} lệnh Global cho Bot!`);

    // 2. CHỐNG NHÂN ĐÔI LỆNH (DEDUPLICATION):
    // Xóa toàn bộ Guild Commands cũ còn sót lại trên các server để Discord không hiển thị x2 lệnh
    if (client && client.guilds && client.guilds.cache.size > 0) {
      for (const [guildId, guild] of client.guilds.cache) {
        try {
          await rest.put(
            Routes.applicationGuildCommands(config.clientId, guildId),
            { body: [] }
          );
        } catch {
          // Bỏ qua nếu không có quyền can thiệp guild
        }
      }
      logger.success(`🧹 Đã dọn dẹp toàn bộ Guild commands thừa trên ${client.guilds.cache.size} máy chủ để tránh bị double lệnh!`);
    }
  } catch (error) {
    logger.error('Lỗi khi đăng ký Slash Commands với Discord REST API:', error);
  }
}

// Cho phép chạy trực tiếp từ dòng lệnh: node src/scripts/deployCommands.js
if (require.main === module) {
  deploySlashCommands();
}

module.exports = { deploySlashCommands };
