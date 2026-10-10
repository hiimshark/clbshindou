const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const guildService = require('../../database/guildService');
const logger = require('../../utils/logger');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const config = guildService.getConfig(member.guild.id);

    // GỬI THÔNG BÁO TẠM BIỆT (GOODBYE EMBED SANG TRỌNG)
    if (config.goodbye_channel_id) {
      try {
        const channel = member.guild.channels.cache.get(config.goodbye_channel_id);
        if (channel) {
          const rawMessage = config.goodbye_message || 
            'Một thành viên vừa rời đi. Chúc bạn có một hành trình mới thật nhiều may mắn và thành công!';

          const formattedMessage = rawMessage
            .replace(/{user}/g, member.user?.tag || member.displayName)
            .replace(/{username}/g, member.user?.username || member.displayName)
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, member.guild.memberCount);

          const joinedTimestamp = member.joinedTimestamp ? Math.floor(member.joinedTimestamp / 1000) : null;

          const embed = CustomEmbed.card(PALETTE.ruby)
            .setAuthor({
              name: `🕊️ THÀNH VIÊN RỜI MÁY CHỦ`,
              iconURL: member.guild.iconURL({ dynamic: true })
            })
            .setTitle(`🥀 Tạm biệt ${member.user?.username || member.displayName}...`)
            .setDescription(
              `${DIVIDER}\n` +
              `> ${formattedMessage}\n` +
              `${DIVIDER}`
            )
            .addFields(
              { name: '👤 Tài khoản', value: `${member.user ? member.user.tag : member.displayName}`, inline: true },
              { name: '🆔 ID', value: `\`${member.id}\``, inline: true },
              { name: '👥 Thành viên còn lại', value: `\`${member.guild.memberCount}\` thành viên`, inline: true },
              ...(joinedTimestamp ? [{ 
                name: '⏳ Đã đồng hành cùng máy chủ từ', 
                value: `<t:${joinedTimestamp}:D> (<t:${joinedTimestamp}:R>)`, 
                inline: false 
              }] : [])
            )
            .setFooter({ 
              text: `Hy vọng sẽ có dịp gặp lại bạn tại ${member.guild.name}! ✨`,
              iconURL: member.guild.iconURL({ dynamic: true }) 
            });

          if (member.user) {
            embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }));
          }

          await channel.send({ embeds: [embed] });
        }
      } catch (err) {
        logger.error(`Lỗi khi gửi thông báo goodbye tại guild ${member.guild.id}:`, err.message);
      }
    }
  }
};
