const CustomEmbed = require('../../utils/embedBuilder');
const guildService = require('../../database/guildService');
const logger = require('../../utils/logger');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const config = guildService.getConfig(member.guild.id);

    // GỬI THÔNG BÁO TẠM BIỆT (GOODBEYE)
    if (config.goodbye_channel_id) {
      try {
        const channel = member.guild.channels.cache.get(config.goodbye_channel_id);
        if (channel) {
          const rawMessage = config.goodbye_message || 
            'Tạm biệt **{username}** đã rời khỏi **{server}**. Hiện máy chủ còn lại {memberCount} thành viên.';
          
          const formattedMessage = rawMessage
            .replace(/{user}/g, member.user?.tag || member.displayName)
            .replace(/{username}/g, member.user?.username || member.displayName)
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, member.guild.memberCount);

          const embed = CustomEmbed.warning(
            `Thành viên đã rời đi 👋`,
            formattedMessage
          );
          if (member.user) {
            embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }));
          }
          embed.setFooter({ text: `ID: ${member.id} • ${member.guild.name}` });

          await channel.send({ embeds: [embed] });
        }
      } catch (err) {
        logger.error(`Lỗi khi gửi thông báo goodbye tại guild ${member.guild.id}:`, err.message);
      }
    }
  }
};
