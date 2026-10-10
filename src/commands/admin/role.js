const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Quản lý cấp và thu hồi vai trò (Role) cho thành viên')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Cấp một vai trò cho thành viên')
        .addUserOption(opt => opt.setName('user').setDescription('Thành viên cần cấp vai trò').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Vai trò cần cấp').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Thu hồi một vai trò khỏi thành viên')
        .addUserOption(opt => opt.setName('user').setDescription('Thành viên cần thu hồi vai trò').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Vai trò cần thu hồi').setRequired(true))
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user');
    const targetRole = interaction.options.getRole('role');

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi', 'Không tìm thấy thành viên này trong máy chủ!')],
        ephemeral: true
      });
    }

    // Role hierarchy checks
    const botMember = interaction.guild.members.me;
    if (targetRole.position >= botMember.roles.highest.position) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi Phân Quyền', 'Bot không thể thao tác với vai trò này vì nó cao hơn hoặc bằng vai trò cao nhất của bot!')],
        ephemeral: true
      });
    }

    if (targetRole.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi Phân Quyền', 'Bạn không thể thao tác với vai trò cao hơn hoặc bằng vai trò cao nhất của bạn!')],
        ephemeral: true
      });
    }

    try {
      if (subcommand === 'add') {
        if (member.roles.cache.has(targetRole.id)) {
          return interaction.reply({
            embeds: [CustomEmbed.warning('Thông Báo', `${member} đã sở hữu vai trò ${targetRole} rồi!`)],
            ephemeral: true
          });
        }
        await member.roles.add(targetRole);
        return interaction.reply({
          embeds: [CustomEmbed.success('Cấp Vai Trò Thành Công', `Đã cấp vai trò ${targetRole} cho ${member}!`)]
        });
      }

      if (subcommand === 'remove') {
        if (!member.roles.cache.has(targetRole.id)) {
          return interaction.reply({
            embeds: [CustomEmbed.warning('Thông Báo', `${member} hiện không có vai trò ${targetRole}!`)],
            ephemeral: true
          });
        }
        await member.roles.remove(targetRole);
        return interaction.reply({
          embeds: [CustomEmbed.success('Thu Hồi Vai Trò Thành Công', `Đã gỡ vai trò ${targetRole} khỏi ${member}!`)]
        });
      }
    } catch (err) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi Thao Tác', err.message)],
        ephemeral: true
      });
    }
  }
};
