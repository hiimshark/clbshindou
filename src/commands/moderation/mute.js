const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

const DURATION_MAP = {
  '60s': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '10m': 10 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '28d': 28 * 24 * 60 * 60 * 1000
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Cấm chat (Timeout) một thành viên vi phạm quy định')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Thành viên cần cấm chat')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Thời gian cấm chat')
        .setRequired(true)
        .addChoices(
          { name: '1 Phút', value: '60s' },
          { name: '5 Phút', value: '5m' },
          { name: '10 Phút', value: '10m' },
          { name: '1 Giờ', value: '1h' },
          { name: '1 Ngày', value: '1d' },
          { name: '7 Ngày', value: '7d' },
          { name: '28 Ngày (Tối đa)', value: '28d' }
        )
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do cấm chat')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const durationKey = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'Không có lý do cụ thể';
    const durationMs = DURATION_MAP[durationKey] || 5 * 60 * 1000;

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi', 'Không tìm thấy thành viên này trong máy chủ!')],
        ephemeral: true
      });
    }

    // Hierarchy Checks
    if (member.id === interaction.user.id) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi', 'Bạn không thể tự cấm chat chính mình!')],
        ephemeral: true
      });
    }

    if (member.id === interaction.guild.ownerId) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi', 'Không thể cấm chat Chủ máy chủ!')],
        ephemeral: true
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi Phân Quyền', 'Bot không có đủ quyền để cấm chat thành viên này (Role của họ cao hơn hoặc bằng bot)!')],
        ephemeral: true
      });
    }

    if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi Phân Quyền', 'Bạn không thể cấm chat người có vai trò cao hơn hoặc bằng bạn!')],
        ephemeral: true
      });
    }

    // Try sending DM notice
    const dmEmbed = CustomEmbed.warning(
      `Bạn Đã Bị Cấm Chat Tại ${interaction.guild.name}`,
      `⏱️ **Thời lượng:** \`${durationKey}\`\n📝 **Lý do:** ${reason}\n👮 **Người xử lý:** ${interaction.user.tag}`
    );
    await member.send({ embeds: [dmEmbed] }).catch(() => {});

    // Apply timeout
    await member.timeout(durationMs, `${interaction.user.tag}: ${reason}`);

    const successEmbed = CustomEmbed.success(
      'Đã Cấm Chat Thành Viên',
      `Đã cấm chat ${member} trong vòng **${durationKey}**.\n📝 **Lý do:** ${reason}`
    );

    await interaction.reply({ embeds: [successEmbed] });
  }
};
