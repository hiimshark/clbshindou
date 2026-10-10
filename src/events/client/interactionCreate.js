const { PermissionFlagsBits } = require('discord.js');
const { config } = require('../../config');
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

      // KIỂM TRA PHÂN QUYỀN VAI TRÒ (ROLE PERMISSIONS)
      const member = interaction.member;
      const isAdmin = member?.roles?.cache?.has(config.roles.admin) || 
                      member?.permissions?.has(PermissionFlagsBits.Administrator) ||
                      interaction.guild?.ownerId === interaction.user.id;

      const hasMusicRole = member?.roles?.cache?.has(config.roles.music);

      // Nếu không phải Admin: áp dụng giới hạn chặt chẽ
      if (!isAdmin) {
        // A. Nếu là lệnh phát nhạc (music): Phải có role Music
        if (command.category === 'music') {
          if (!hasMusicRole) {
            return interaction.reply({
              embeds: [CustomEmbed.error(
                'Thiếu Quyền Truy Cập',
                `Bạn cần có vai trò <@&${config.roles.music}> để sử dụng các lệnh phát nhạc!`
              )],
              ephemeral: true
            });
          }
        } else {
          // B. Nếu người dùng có role Music nhưng KHÔNG phải Admin:
          // Người có role Music CHỈ được phép dùng các lệnh phát nhạc
          if (hasMusicRole) {
            return interaction.reply({
              embeds: [CustomEmbed.error(
                'Giới Hạn Phân Quyền',
                `Vai trò <@&${config.roles.music}> của bạn chỉ được phép dùng các lệnh phát nhạc của bot!`
              )],
              ephemeral: true
            });
          }

          // C. Các lệnh quản trị / cấu hình / ticket yêu cầu quyền Admin
          if (['admin', 'moderation', 'ticket'].includes(command.category)) {
            return interaction.reply({
              embeds: [CustomEmbed.error(
                'Lỗi Phân Quyền',
                `Bạn cần có vai trò Quản trị viên <@&${config.roles.admin}> để sử dụng lệnh này!`
              )],
              ephemeral: true
            });
          }
        }
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
