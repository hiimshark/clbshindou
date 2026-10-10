const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const guildService = require('../../database/guildService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setgoodbye')
    .setDescription('Cài đặt kênh gửi tin nhắn tạm biệt khi thành viên rời máy chủ')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Kênh sẽ nhận thông báo tạm biệt')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    )
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('Nội dung tạm biệt (Placeholders: {user}, {username}, {server}, {memberCount})')
        .setRequired(false)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');

    guildService.setGoodbye(interaction.guildId, channel.id, message);

    const embed = CustomEmbed.success(
      'Cấu Hình Goodbye Thành Công',
      `✅ Đã đặt kênh tạm biệt thành viên tại: ${channel}\n` +
      `📝 **Tin nhắn:** \`${message || 'Mặc định'}\`\n\n` +
      `💡 *Mẹo: Bạn có thể sử dụng các biến: \`{user}\`, \`{username}\`, \`{server}\`, \`{memberCount}\` trong câu tạm biệt.*`
    );

    await interaction.reply({ embeds: [embed] });
  }
};
