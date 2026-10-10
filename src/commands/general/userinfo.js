const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Xem thông tin chi tiết về một thành viên trong máy chủ')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Thành viên cần tra cứu (để trống để xem của bản thân)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    const createdTimestamp = Math.floor(targetUser.createdTimestamp / 1000);
    const joinedTimestamp = member ? Math.floor(member.joinedTimestamp / 1000) : null;

    const roles = member 
      ? member.roles.cache
          .filter(r => r.id !== interaction.guild.id)
          .map(r => `${r}`)
          .join(', ') || 'Không có role'
      : 'Không có thông tin';

    const embed = CustomEmbed.info(`Thông Tin Thành Viên: ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '👤 Tên người dùng', value: `${targetUser.tag} (\`${targetUser.id}\`)`, inline: true },
        { name: '🤖 Là Bot?', value: targetUser.bot ? 'Có' : 'Không', inline: true },
        { name: '🏷️ Biệt danh', value: member?.nickname || 'Không có', inline: true },
        { name: '📅 Ngày tạo tài khoản', value: `<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)`, inline: false },
        { 
          name: '📥 Ngày gia nhập máy chủ', 
          value: joinedTimestamp ? `<t:${joinedTimestamp}:F> (<t:${joinedTimestamp}:R>)` : 'Chưa tham gia', 
          inline: false 
        },
        { name: `🎭 Danh sách vai trò (${member ? member.roles.cache.size - 1 : 0})`, value: roles.slice(0, 1024), inline: false }
      )
      .setFooter({ text: `ID: ${targetUser.id}` });

    await interaction.reply({ embeds: [embed] });
  }
};
