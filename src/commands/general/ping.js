const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Kiểm tra độ trễ mạng, WebSocket và tài nguyên hệ thống'),

  async execute(interaction, client) {
    const sent = await interaction.reply({ content: 'Đang đo độ trễ...', fetchReply: true });
    const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const wsPing = client.ws.ping;

    // Memory usage in MB
    const memoryUsageMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    const uptimeMinutes = Math.floor(process.uptime() / 60);

    const embed = CustomEmbed.info('Báo Cáo Trạng Thái & Độ Trễ')
      .addFields(
        { name: '🏓 Roundtrip Latency', value: `\`${roundtripLatency}ms\``, inline: true },
        { name: '🌐 Discord WebSocket', value: `\`${wsPing}ms\``, inline: true },
        { name: '💾 Bộ nhớ RAM', value: `\`${memoryUsageMB} MB\``, inline: true },
        { name: '⏱️ Thời gian hoạt động', value: `\`${uptimeMinutes} phút\``, inline: true },
        { name: '☁️ Máy chủ Hosting', value: '`Railway Container (24/7)`', inline: true }
      );

    await interaction.editReply({ content: null, embeds: [embed] });
  }
};
