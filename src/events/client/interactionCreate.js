const logger = require('../../utils/logger');
const CustomEmbed = require('../../utils/embedBuilder');
const { handleInteractionComponents } = require('../../handlers/componentHandler');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // 1. Slash commands handler
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        logger.warn(`Không tìm thấy lệnh: ${interaction.commandName}`);
        return interaction.reply({
          embeds: [CustomEmbed.error('Lỗi Lệnh', 'Lệnh này hiện không tồn tại hoặc đã bị gỡ bỏ!')],
          ephemeral: true
        });
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        logger.error(`Lỗi thực thi lệnh /${interaction.commandName}:`, error);

        const errorEmbed = CustomEmbed.error(
          'Đã Xảy Ra Lỗi',
          `Không thể thực thi lệnh: \`${error.message || 'Lỗi không xác định'}\``
        );

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
        }
      }
      return;
    }

    // 2. Buttons, Modals, Select Menus handler
    if (interaction.isButton() || interaction.isModalSubmit() || interaction.isAnySelectMenu()) {
      await handleInteractionComponents(interaction, client);
    }
  }
};
