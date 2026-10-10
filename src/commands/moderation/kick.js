const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Trục xuất (Kick) một thành viên khỏi máy chủ')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Thành viên cần trục xuất')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do trục xuất')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Không có lý do cụ thể';

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi', 'Không tìm thấy thành viên này trong máy chủ!')],
        ephemeral: true
      });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi', 'Bạn không thể tự kick chính mình!')],
        ephemeral: true
      });
    }

    if (member.id === interaction.guild.ownerId) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi', 'Không thể kick Chủ máy chủ!')],
        ephemeral: true
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi Phân Quyền', 'Bot không đủ quyền để kick người này!')],
        ephemeral: true
      });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi Phân Quyền', 'Bạn không thể kick người có vai trò cao hơn hoặc bằng bạn!')],
        ephemeral: true
      });
    }

    // Send DM
    const dmEmbed = CustomEmbed.warning(
      `Bạn Đã Bị Trục Xuất Khỏi ${interaction.guild.name}`,
      `📝 **Lý do:** ${reason}\n👮 **Người thực thi:** ${interaction.user.tag}`
    );
    await member.send({ embeds: [dmEmbed] }).catch(() => {});

    await member.kick(`${interaction.user.tag}: ${reason}`);

    const successEmbed = CustomEmbed.success(
      'Đã Trục Xuất Thành Viên',
      `Đã kick **${targetUser.tag}** khỏi máy chủ.\n📝 **Lý do:** ${reason}`
    );

    await interaction.reply({ embeds: [successEmbed] });
  }
};
