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
    logger.info(`Bắt đầu đăng ký ${commands.length} application (/) commands...`);

    // 1. Đăng ký Global commands
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );
    logger.success(`Đã đăng ký ${commands.length} lệnh Global cho Bot!`);

    // 2. Đăng ký TỨC THÌ (Instant Guild Commands) cho tất cả server bot đang tham gia
    if (client && client.guilds && client.guilds.cache.size > 0) {
      for (const [guildId, guild] of client.guilds.cache) {
        try {
          await rest.put(
            Routes.applicationGuildCommands(config.clientId, guildId),
            { body: commands }
          );
          logger.success(`⚡ Đã đồng bộ ${commands.length} lệnh tức thì cho máy chủ: ${guild.name} (${guildId})!`);
        } catch (guildErr) {
          logger.warn(`Không thể đăng ký lệnh riêng cho guild ${guild.name}:`, guildErr.message);
        }
      }
    } else if (config.devGuildId) {
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.devGuildId),
        { body: commands }
      );
      logger.success(`Đã đăng ký lệnh cho Dev Guild: ${config.devGuildId}`);
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
