const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const guildService = require('../../database/guildService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Cài đặt kênh gửi tin nhắn chào mừng thành viên mới')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Kênh sẽ nhận thông báo chào mừng')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    )
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('Nội dung chào mừng (Placeholders: {user}, {username}, {server}, {memberCount})')
        .setRequired(false)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');

    guildService.setWelcome(interaction.guildId, channel.id, message);

    const embed = CustomEmbed.success(
      'Cấu Hình Welcome Thành Công',
      `✅ Đã đặt kênh chào mừng thành viên mới tại: ${channel}\n` +
      `📝 **Tin nhắn:** \`${message || 'Mặc định'}\`\n\n` +
      `💡 *Mẹo: Bạn có thể sử dụng các biến: \`{user}\`, \`{username}\`, \`{server}\`, \`{memberCount}\` trong câu chào mừng.*`
    );

    await interaction.reply({ embeds: [embed] });
  }
};
