const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { createMusicButtons } = require('../../handlers/musicHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Xem thông tin chi tiết bài hát đang phát và thanh điều khiển tương tác'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue || !queue.songs[0]) {
      return interaction.reply({
        embeds: [CustomEmbed.warning('Thông Báo', 'Hiện không có bài hát nào đang phát!')],
        ephemeral: true
      });
    }

    const song = queue.songs[0];
    const embed = CustomEmbed.info(
      'Đang Phát Hiện Tại',
      `🎵 **[${song.name}](${song.url})**\n\n` +
      `⏱️ **Tiến trình:** \`${queue.formattedCurrentTime} / ${song.formattedDuration}\`\n` +
      `👤 **Yêu cầu bởi:** ${song.user}\n` +
      `🔊 **Âm lượng:** \`${queue.volume}%\`\n` +
      `🔁 **Chế độ lặp:** \`${queue.repeatMode === 2 ? 'Lặp cả hàng đợi' : queue.repeatMode === 1 ? 'Lặp bài hát này' : 'Tắt'}\`\n` +
      `⏯️ **Trạng thái:** \`${queue.paused ? 'Đang tạm dừng' : 'Đang phát'}\``
    );

    if (song.thumbnail) embed.setThumbnail(song.thumbnail);

    const buttons = createMusicButtons();
    return interaction.reply({ embeds: [embed], components: [buttons] });
  }
};
