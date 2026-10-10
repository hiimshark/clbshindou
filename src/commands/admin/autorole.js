const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const guildService = require('../../database/guildService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Thiết lập vai trò tự động cấp cho thành viên mới khi tham gia máy chủ')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Chọn vai trò tự động cấp')
        .addRoleOption(opt => opt.setName('role').setDescription('Vai trò tân thủ').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Tắt tính năng tự động cấp vai trò')
    )
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('Xem trạng thái cấu hình vai trò tự động hiện tại')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      const role = interaction.options.getRole('role');
      const botMember = interaction.guild.members.me;

      if (role.position >= botMember.roles.highest.position) {
        return interaction.reply({
          embeds: [CustomEmbed.error('Lỗi Phân Quyền', 'Vai trò này cao hơn hoặc bằng vai trò của bot, bot sẽ không thể tự cấp cho thành viên mới!')],
          ephemeral: true
        });
      }

      guildService.setAutoRole(interaction.guildId, role.id);
      return interaction.reply({
        embeds: [CustomEmbed.success('Thiết Lập AutoRole', `Đã cài đặt: Thành viên mới tham gia sẽ tự động nhận vai trò ${role}!`)]
      });
    }

    if (subcommand === 'remove') {
      guildService.setAutoRole(interaction.guildId, null);
      return interaction.reply({
        embeds: [CustomEmbed.success('Đã Tắt AutoRole', 'Đã tắt tính năng tự động cấp vai trò cho thành viên mới!')]
      });
    }

    if (subcommand === 'status') {
      const config = guildService.getConfig(interaction.guildId);
      const role = config.autorole_id ? interaction.guild.roles.cache.get(config.autorole_id) : null;

      const embed = CustomEmbed.info(
        'Trạng Thái AutoRole',
        role 
          ? `Vai trò tự động đang được kích hoạt: ${role} (\`${role.id}\`)`
          : 'Hiện chưa cấu hình vai trò tự động cấp cho máy chủ này.'
      );
      return interaction.reply({ embeds: [embed] });
    }
  }
};
