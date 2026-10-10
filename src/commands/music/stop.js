const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Dừng phát nhạc, xóa toàn bộ hàng đợi và rời khỏi phòng thoại'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue) {
      return interaction.reply({
        embeds: [CustomEmbed.warning('Thông Báo', 'Bot hiện không phát nhạc trong máy chủ này!')],
        ephemeral: true
      });
    }

    try {
      await queue.stop();
      return interaction.reply({
        embeds: [CustomEmbed.error('Dừng Phát Nhạc', 'Đã dừng phát và giải phóng kết nối phòng thoại!')]
      });
    } catch (err) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi', err.message)],
        ephemeral: true
      });
    }
  }
};
