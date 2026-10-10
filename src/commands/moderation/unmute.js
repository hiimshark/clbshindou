const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Gỡ bỏ cấm chat (Timeout) cho một thành viên')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Thành viên cần gỡ cấm chat')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do gỡ cấm chat')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Được gỡ cấm chat bởi quản trị viên';

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi', 'Không tìm thấy thành viên này trong máy chủ!')],
        ephemeral: true
      });
    }

    if (!member.isCommunicationDisabled()) {
      return interaction.reply({
        embeds: [CustomEmbed.warning('Thông Báo', 'Thành viên này hiện không bị cấm chat!')],
        ephemeral: true
      });
    }

    await member.timeout(null, `${interaction.user.tag}: ${reason}`);

    const successEmbed = CustomEmbed.success(
      'Đã Gỡ Cấm Chat',
      `Đã hủy cấm chat cho ${member}.\n📝 **Lý do:** ${reason}`
    );

    await interaction.reply({ embeds: [successEmbed] });
  }
};
