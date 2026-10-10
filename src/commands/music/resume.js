const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Tiếp tục phát bài hát đang tạm dừng'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue) {
      return interaction.reply({
        embeds: [CustomEmbed.warning('Thông Báo', 'Hiện không có bài hát nào đang phát!')],
        ephemeral: true
      });
    }

    if (!queue.paused) {
      return interaction.reply({
        embeds: [CustomEmbed.warning('Thông Báo', 'Bài hát đang được phát bình thường!')],
        ephemeral: true
      });
    }

    queue.resume();
    return interaction.reply({
      embeds: [CustomEmbed.success('Tiếp Tục Phát', 'Đã tiếp tục phát nhạc!')]
    });
  }
};
