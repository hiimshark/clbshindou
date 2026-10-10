const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const guildService = require('../../database/guildService');
const logger = require('../../utils/logger');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const config = guildService.getConfig(member.guild.id);

    // 1. CẤP ROLE TỰ ĐỘNG (AUTOROLE)
    if (config.autorole_id) {
      try {
        const role = member.guild.roles.cache.get(config.autorole_id);
        if (role) {
          await member.roles.add(role);
          logger.info(`Tự động cấp role ${role.name} cho thành viên mới ${member.user.tag}`);
        }
      } catch (err) {
        logger.error(`Không thể tự động cấp role cho ${member.user.tag}:`, err.message);
      }
    }

    // 2. GỬI THÔNG BÁO CHÀO MỪNG (WELCOME EMBED LỘNG LẪY)
    if (config.welcome_channel_id) {
      try {
        const channel = member.guild.channels.cache.get(config.welcome_channel_id);
        if (channel) {
          const rawMessage = config.welcome_message || 
            'Chào mừng bạn đã gia nhập vào đại gia đình của chúng tôi! Chúc bạn có những phút giây giao lưu, nghe nhạc và giải trí thật vui vẻ nhé! 💖';

          const formattedMessage = rawMessage
            .replace(/{user}/g, `${member}`)
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, member.guild.memberCount);

          const createdTimestamp = Math.floor(member.user.createdTimestamp / 1000);

          const embed = CustomEmbed.card(PALETTE.cyan)
            .setAuthor({
              name: `🎉 CHÀO MỪNG THÀNH VIÊN MỚI!`,
              iconURL: member.guild.iconURL({ dynamic: true }) || member.user.displayAvatarURL()
            })
            .setTitle(`✨ Welcome to ${member.guild.name}! ✨`)
            .setDescription(
              `${DIVIDER}\n` +
              `👋 Xin chào ${member}! Cảm ơn bạn đã ghé thăm máy chủ!\n\n` +
              `💬 **Lời chào:**\n> ${formattedMessage}\n` +
              `${DIVIDER}`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
              { name: '👤 Tên người dùng', value: `${member.user.tag}`, inline: true },
              { name: '🆔 ID Tài khoản', value: `\`${member.id}\``, inline: true },
              { name: '📊 Thành viên thứ', value: `\`#${member.guild.memberCount}\``, inline: true },
              { 
                name: '📅 Ngày tạo tài khoản', 
                value: `<t:${createdTimestamp}:D> (<t:${createdTimestamp}:R>)`, 
                inline: false 
              }
            )
            .setFooter({
              text: `Máy chủ: ${member.guild.name} • Hãy đọc kỹ nội quy máy chủ nhé! 💖`,
              iconURL: member.guild.iconURL({ dynamic: true })
            });

          await channel.send({ content: `🎊 ${member} vừa tham gia máy chủ!`, embeds: [embed] });
        }
      } catch (err) {
        logger.error(`Lỗi khi gửi thông báo welcome tại guild ${member.guild.id}:`, err.message);
      }
    }
  }
};
