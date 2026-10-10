const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const EMOJIS = require('../../utils/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Kiểm tra độ trễ mạng, WebSocket và tài nguyên hệ thống'),

  async execute(interaction, client) {
    const sent = await interaction.reply({ content: 'Đang đo độ trễ hệ thống...', fetchReply: true });
    const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const wsPing = client.ws.ping;

    // Memory usage in MB
    const memoryUsageMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    const uptimeMinutes = Math.floor(process.uptime() / 60);

    const embed = CustomEmbed.card(PALETTE.emerald)
      .setTitle(`${EMOJIS.star} Báo Cáo Trạng Thái & Độ Trễ Hệ Thống`)
      .setDescription(
        `${DIVIDER}\n` +
        `🏓 **Roundtrip Latency:** \`${roundtripLatency}ms\`\n` +
        `🌐 **Discord WebSocket:** \`${wsPing}ms\`\n` +
        `💾 **Bộ nhớ RAM tiêu thụ:** \`${memoryUsageMB} MB\`\n` +
        `⏱️ **Thời gian trực tuyến:** \`${uptimeMinutes} phút\`\n` +
        `${EMOJIS.crownOwner} **Nền tảng Hosting:** \`Railway Cloud Container (24/7)\`\n` +
        `${DIVIDER}`
      )
      .setFooter({ text: `SHINDOU ENGINE • Hoạt động ổn định 100%`, iconURL: client.user.displayAvatarURL() });

    await interaction.editReply({ content: null, embeds: [embed] });
  }
};
