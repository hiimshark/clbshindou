const logger = require('../../utils/logger');
const { deploySlashCommands } = require('../../scripts/deployCommands');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const EMOJIS = require('../../utils/emojis');

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
      const introEmbed = CustomEmbed.card(PALETTE.amethyst)
        .setAuthor({
          name: `CẢM ƠN BẠN ĐÃ MỜI BOT!`,
          iconURL: client.user.displayAvatarURL()
        })
        .setTitle(`${EMOJIS.party} ${client.user.username} Đã Sẵn Sàng Phục Vụ! ${EMOJIS.crownPink}`)
        .setDescription(
          `Chào mừng bạn đến với hệ thống bot đa năng cao cấp 24/7!\n\n` +
          `${DIVIDER}\n` +
          `📌 **CÁC TÍNH NĂNG CHÍNH ĐÃ KÍCH HOẠT:**\n` +
          `${EMOJIS.spotify} **Phát nhạc 320kbps:** \`/play\`, \`/skip\`, \`/queue\`, \`/nowplaying\`\n` +
          `🎮 **Minigame Nối từ VN:** \`/noitu set\`, \`/noitu stats\`\n` +
          `🎫 **Hệ thống CSKH & Ticket:** \`/ticket setup\`\n` +
          `🛡️ **Quản trị & Kiểm duyệt:** \`/mute\`, \`/ban\`, \`/kick\`, \`/clear\`, \`/role\`\n` +
          `📢 **Thông báo Embed cao cấp:** \`/announce\`\n` +
          `👋 **Hệ thống Chào mừng / Tạm biệt:** \`/setwelcome\`, \`/setgoodbye\`\n` +
          `${DIVIDER}\n` +
          `👉 Gõ dấu gạch chéo **\`/\`** để khám phá và sử dụng toàn bộ tính năng!`
        )
        .setFooter({ text: `Hỗ trợ 24/7 trên Railway • SHINDOU ENGINE`, iconURL: client.user.displayAvatarURL() });

      await defaultChannel.send({ embeds: [introEmbed] }).catch(() => {});
    }
  }
};
