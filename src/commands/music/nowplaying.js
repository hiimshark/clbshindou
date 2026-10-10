const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const EMOJIS = require('../../utils/emojis');
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
    const embed = CustomEmbed.card(PALETTE.emerald)
      .setAuthor({
        name: `TRÌNH PHÁT NHẠC CAO CẤP • SHINDOU AUDIO`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTitle(`${EMOJIS.spotify} Đang Phát: ${song.name}`)
      .setURL(song.url)
      .setDescription(
        `${DIVIDER}\n` +
        `🎵 **Bài hát:** [${song.name}](${song.url})\n` +
        `⏱️ **Tiến trình:** \`${queue.formattedCurrentTime} / ${song.formattedDuration}\`\n` +
        `${EMOJIS.crownOwner} **Yêu cầu bởi:** ${song.user}\n` +
        `🔊 **Âm lượng:** \`${queue.volume}%\` | 🔁 **Lặp:** \`${queue.repeatMode === 2 ? 'Cả hàng đợi' : queue.repeatMode === 1 ? 'Bài này' : 'Tắt'}\`\n` +
        `⏯️ **Trạng thái:** \`${queue.paused ? 'Tạm dừng' : 'Đang phát'}\`\n` +
        `${DIVIDER}`
      )
      .setFooter({ text: `${interaction.guild.name} • 320kbps High Fidelity Audio ${EMOJIS.star}` });

    if (song.thumbnail) embed.setThumbnail(song.thumbnail);

    const buttons = createMusicButtons();
    return interaction.reply({ embeds: [embed], components: [buttons] });
  }
};
