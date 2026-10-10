const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Bỏ qua bài hát đang phát sang bài tiếp theo'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue) {
      return interaction.reply({
        embeds: [CustomEmbed.warning('Hết Nhạc', 'Hiện tại không có bài hát nào đang phát!')],
        ephemeral: true
      });
    }

    if (queue.songs.length <= 1 && !queue.autoplay) {
      return interaction.reply({
        embeds: [CustomEmbed.warning('Không Thể Bỏ Qua', 'Đây là bài hát cuối cùng trong danh sách chờ!')],
        ephemeral: true
      });
    }

    try {
      const skippedSong = queue.songs[0];
      await queue.skip();
      return interaction.reply({
        embeds: [CustomEmbed.success('Bỏ Qua Thành Công', `Đã bỏ qua bài hát: **${skippedSong.name}**`)]
      });
    } catch (err) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi', err.message)],
        ephemeral: true
      });
    }
  }
};
