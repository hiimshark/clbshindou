const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emojis')
    .setDescription('Quét và hiển thị toàn bộ danh sách Emoji tùy chỉnh cùng ID trong máy chủ'),

  async execute(interaction) {
    const emojis = interaction.guild.emojis.cache;

    if (emojis.size === 0) {
      return interaction.reply({
        embeds: [CustomEmbed.warning('Thông Báo', 'Máy chủ này hiện chưa có emoji tùy chỉnh nào!')],
        ephemeral: true
      });
    }

    const staticEmojis = emojis.filter(e => !e.animated);
    const animatedEmojis = emojis.filter(e => e.animated);

    let description = `${DIVIDER}\n`;
    description += `📊 **Tổng số Emoji:** \`${emojis.size}\` (Tĩnh: \`${staticEmojis.size}\` | Động: \`${animatedEmojis.size}\`)\n\n`;

    // Lấy tối đa 25 emoji tiêu biểu để tránh vượt giới hạn ký tự
    const displayList = Array.from(emojis.values()).slice(0, 30);
    description += `📋 **DANH SÁCH MÃ EMOJI (COPY ĐỂ DÙNG):**\n`;
    for (const e of displayList) {
      const code = e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`;
      description += `${e} \`${code}\`\n`;
    }

    if (emojis.size > 30) {
      description += `\n*...và ${emojis.size - 30} emoji khác nữa.*\n`;
    }
    description += `${DIVIDER}`;

    const embed = CustomEmbed.card(PALETTE.blurple)
      .setTitle(`✨ BẢNG DANH SÁCH EMOJI • ${interaction.guild.name} ✨`)
      .setDescription(description)
      .setFooter({ text: `Gõ /emojis để xem lại bất kỳ lúc nào!` });

    return interaction.reply({ embeds: [embed] });
  }
};
