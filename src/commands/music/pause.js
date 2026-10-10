const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Tạm dừng bài hát đang phát'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue) {
      return interaction.reply({
        embeds: [CustomEmbed.warning('Thông Báo', 'Hiện không có bài hát nào đang phát!')],
        ephemeral: true
      });
    }

    if (queue.paused) {
      return interaction.reply({
        embeds: [CustomEmbed.warning('Thông Báo', 'Bài hát đã ở trạng thái tạm dừng rồi!')],
        ephemeral: true
      });
    }

    queue.pause();
    return interaction.reply({
      embeds: [CustomEmbed.warning('Tạm Dừng', 'Đã tạm dừng phát nhạc!')]
    });
  }
};
