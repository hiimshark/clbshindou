const CustomEmbed = require('../../utils/embedBuilder');
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

    // 2. GỬI THÔNG BÁO CHÀO MỪNG (WELCOME)
    if (config.welcome_channel_id) {
      try {
        const channel = member.guild.channels.cache.get(config.welcome_channel_id);
        if (channel) {
          const rawMessage = config.welcome_message || 
            'Chào mừng {user} đã gia nhập **{server}**! Bạn là thành viên thứ #{memberCount} của chúng tôi. Chúc bạn có những phút giây vui vẻ!';
          
          const formattedMessage = rawMessage
            .replace(/{user}/g, `${member}`)
            .replace(/{username}/g, member.user.username)
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, member.guild.memberCount);

          const embed = CustomEmbed.info(
            `Chào mừng thành viên mới! 🎉`,
            formattedMessage
          );
          embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }));
          embed.setFooter({ text: `ID: ${member.id} • ${member.guild.name}` });

          await channel.send({ content: `${member}`, embeds: [embed] });
        }
      } catch (err) {
        logger.error(`Lỗi khi gửi thông báo welcome tại guild ${member.guild.id}:`, err.message);
      }
    }
  }
};
