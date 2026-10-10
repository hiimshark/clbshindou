const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const EMOJIS = require('../../utils/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Xem danh sách các bài hát trong hàng đợi phát nhạc'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue || queue.songs.length === 0) {
      return interaction.reply({
        embeds: [CustomEmbed.info('Hàng Đợi Trống', `${EMOJIS.star} Hiện không có bài hát nào trong hàng đợi!`)],
        ephemeral: true
      });
    }

    const currentSong = queue.songs[0];
    const tracks = queue.songs
      .slice(1, 11)
      .map((song, index) => `\`${index + 1}.\` [${song.name}](${song.url}) - \`${song.formattedDuration}\` | ${EMOJIS.purplePaw} ${song.user}`)
      .join('\n');

    const embed = CustomEmbed.card(PALETTE.amethyst)
      .setTitle(`${EMOJIS.spotify} Danh Sách Hàng Đợi - ${interaction.guild.name}`)
      .setDescription(
        `${DIVIDER}\n` +
        `▶️ **Đang phát:** [${currentSong.name}](${currentSong.url}) (\`${currentSong.formattedDuration}\`)\n\n` +
        `📜 **Danh sách tiếp theo:**\n${tracks || '*(Không có bài hát tiếp theo)*'}` +
        (queue.songs.length > 11 ? `\n\n*...và ${queue.songs.length - 11} bài hát khác trong hàng đợi.*` : '') +
        `\n${DIVIDER}`
      ).setFooter({
        text: `Tổng cộng: ${queue.songs.length} bài hát • Tổng thời lượng: ${queue.formattedDuration} • Âm lượng: ${queue.volume}%`
      });

    return interaction.reply({ embeds: [embed] });
  }
};
