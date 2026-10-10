const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Cấm (Ban) vĩnh viễn một người dùng khỏi máy chủ')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Người dùng cần cấm')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do cấm')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('delete_days')
        .setDescription('Xóa tin nhắn cũ của người này (số ngày, từ 0 đến 7)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(7)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Vi phạm quy định máy chủ';
    const deleteDays = interaction.options.getInteger('delete_days') || 0;

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (member) {
      if (member.id === interaction.user.id) {
        return interaction.reply({
          embeds: [CustomEmbed.error('Lỗi', 'Bạn không thể tự ban chính mình!')],
          ephemeral: true
        });
      }

      if (member.id === interaction.guild.ownerId) {
        return interaction.reply({
          embeds: [CustomEmbed.error('Lỗi', 'Không thể ban Chủ máy chủ!')],
          ephemeral: true
        });
      }

      if (!member.bannable) {
        return interaction.reply({
          embeds: [CustomEmbed.error('Lỗi Phân Quyền', 'Bot không đủ quyền để ban người này!')],
          ephemeral: true
        });
      }

      if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
        return interaction.reply({
          embeds: [CustomEmbed.error('Lỗi Phân Quyền', 'Bạn không thể ban người có vai trò cao hơn hoặc bằng bạn!')],
          ephemeral: true
        });
      }

      // Try sending DM
      const dmEmbed = CustomEmbed.error(
        `Bạn Đã Bị Cấm Khỏi ${interaction.guild.name}`,
        `📝 **Lý do:** ${reason}\n👮 **Người thực thi:** ${interaction.user.tag}`
      );
      await member.send({ embeds: [dmEmbed] }).catch(() => {});
    }

    // Ban user
    await interaction.guild.bans.create(targetUser.id, {
      reason: `${interaction.user.tag}: ${reason}`,
      deleteMessageSeconds: deleteDays * 24 * 60 * 60
    });

    const successEmbed = CustomEmbed.success(
      'Đã Ban Thành Viên',
      `Đã cấm vĩnh viễn **${targetUser.tag}** (\`${targetUser.id}\`) khỏi máy chủ.\n📝 **Lý do:** ${reason}`
    );

    await interaction.reply({ embeds: [successEmbed] });
  }
};
