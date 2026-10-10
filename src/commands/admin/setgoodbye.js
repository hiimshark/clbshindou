const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const EMOJIS = require('../../utils/emojis');
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

    const embed = CustomEmbed.card(PALETTE.ruby)
      .setTitle(`${EMOJIS.brownBow} Cấu Hình Tạm Biệt (Goodbye) Thành Công!`)
      .setDescription(
        `${DIVIDER}\n` +
        `📍 **Kênh tạm biệt:** ${channel}\n` +
        `💬 **Lời tạm biệt tuỳ chỉnh:** \`${message || 'Mặc định'}\`\n\n` +
        `💡 *Biến hỗ trợ: \`{user}\`, \`{username}\`, \`{server}\`, \`{memberCount}\`*\n` +
        `${DIVIDER}`
      )
      .setFooter({ text: `${interaction.guild.name} • Goodbye System Active ${EMOJIS.star}` });

    await interaction.reply({ embeds: [embed] });
  }
};
