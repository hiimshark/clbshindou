const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const EMOJIS = require('../../utils/emojis');

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
          .join(' ') || 'Không có role'
      : 'Không có thông tin';

    const embed = CustomEmbed.card(PALETTE.amethyst)
      .setAuthor({
        name: `HỒ SƠ THÀNH VIÊN • ${targetUser.username.toUpperCase()}`,
        iconURL: targetUser.displayAvatarURL({ dynamic: true })
      })
      .setTitle(`${EMOJIS.sparkle} Chi Tiết Người Dùng`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .setDescription(
        `${DIVIDER}\n` +
        `👤 **Tài khoản:** ${targetUser} (\`${targetUser.id}\`)\n` +
        `${EMOJIS.purplePaw} **Biệt danh:** \`${member?.nickname || 'Không có'}\`\n` +
        `${EMOJIS.star4} **Là Bot:** \`${targetUser.bot ? 'Có' : 'Không'}\`\n\n` +
        `📅 **Ngày tạo tài khoản:**\n<t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)\n\n` +
        `📥 **Ngày tham gia máy chủ:**\n` +
        (joinedTimestamp ? `<t:${joinedTimestamp}:F> (<t:${joinedTimestamp}:R>)` : 'Chưa tham gia') + `\n\n` +
        `${EMOJIS.vip} **Vai trò sở hữu (${member ? member.roles.cache.size - 1 : 0}):**\n` +
        `${roles.slice(0, 1000)}\n` +
        `${DIVIDER}`
      )
      .setFooter({
        text: `Yêu cầu bởi ${interaction.user.tag} • ${interaction.guild.name}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });

    await interaction.reply({ embeds: [embed] });
  }
};
