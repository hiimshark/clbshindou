const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { config } = require('../config');
const logger = require('../utils/logger');

async function deploySlashCommands() {
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

    if (config.devGuildId) {
      // Fast registration for development guild
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.devGuildId),
        { body: commands }
      );
      logger.success(`Đã đăng ký ${commands.length} lệnh cho Dev Guild: ${config.devGuildId}`);
    } else {
      // Global registration
      await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commands }
      );
      logger.success(`Đã đăng ký thành công ${commands.length} lệnh Global cho Bot!`);
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
