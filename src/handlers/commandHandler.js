const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFolders = fs.readdirSync(commandsPath);

  let loadedCount = 0;
  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      try {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
          loadedCount++;
        } else {
          logger.warn(`Lệnh tại ${filePath} thiếu trường "data" hoặc "execute"!`);
        }
      } catch (err) {
        logger.error(`Lỗi khi nạp lệnh ${filePath}:`, err.message);
      }
    }
  }

  logger.info(`Đã nạp thành công ${loadedCount} Slash Commands vào bộ nhớ.`);
}

module.exports = { loadCommands };
