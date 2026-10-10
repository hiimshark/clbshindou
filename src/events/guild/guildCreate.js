const logger = require('../../utils/logger');
const { deploySlashCommands } = require('../../scripts/deployCommands');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');

module.exports = {
  name: 'guildCreate',
  async execute(guild, client) {
    logger.success(`====================================================`);
    logger.success(`🎉 BOT VỪA ĐƯỢC THÊM VÀO MÁY CHỦ MỚI: ${guild.name}`);
    logger.success(`ID Máy chủ: ${guild.id}`);
    logger.success(`Số thành viên: ${guild.memberCount}`);
    logger.success(`Tổng số máy chủ hiện tại: ${client.guilds.cache.size}`);
    logger.success(`====================================================`);

    // Đồng bộ lại slash commands cho máy chủ mới
    try {
      await deploySlashCommands(client);
    } catch (err) {
      logger.error('Lỗi khi đồng bộ lệnh cho máy chủ mới:', err.message);
    }

    // Gửi lời chào vào kênh hệ thống nếu có
    const defaultChannel = guild.systemChannel || 
      guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me)?.has('SendMessages'));

    if (defaultChannel) {
      const introEmbed = CustomEmbed.card(PALETTE.blurple)
        .setAuthor({
          name: `CẢM ƠN BẠN ĐÃ MỜI BOT!`,
          iconURL: client.user.displayAvatarURL()
        })
        .setTitle(`✨ ${client.user.username} Đã Sẵn Sàng Phục Vụ! ✨`)
        .setDescription(
          `Chào mừng bạn đến với bot đa chức năng 24/7!\n\n` +
          `${DIVIDER}\n` +
          `📌 **CÁC TÍNH NĂNG CHÍNH:**\n` +
          `• 🎵 **Phát nhạc:** \`/play\`, \`/skip\`, \`/queue\`, \`/nowplaying\`\n` +
          `• 🎮 **Nối từ VN:** \`/noitu set\`, \`/noitu stats\`\n` +
          `• 🎫 **Tạo Ticket:** \`/ticket setup\`\n` +
          `• 🛡️ **Quản trị & Phạt:** \`/mute\`, \`/ban\`, \`/clear\`, \`/role\`\n` +
          `• 📢 **Thông báo:** \`/announce\`\n` +
          `• 👋 **Welcome/Goodbye:** \`/setwelcome\`, \`/setgoodbye\`\n` +
          `${DIVIDER}\n` +
          `👉 Gõ dấu gạch chéo **\`/\`** để khám phá toàn bộ lệnh của bot!`
        )
        .setFooter({ text: `Hỗ trợ 24/7 trên Railway • Chúc bạn có trải nghiệm tuyệt vời!` });

      await defaultChannel.send({ embeds: [introEmbed] }).catch(() => {});
    }
  }
};
