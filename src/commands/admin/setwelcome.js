const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const EMOJIS = require('../../utils/emojis');
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

    const embed = CustomEmbed.card(PALETTE.cyan)
      .setTitle(`${EMOJIS.party} Cấu Hình Chào Mừng (Welcome) Thành Công!`)
      .setDescription(
        `${DIVIDER}\n` +
        `📍 **Kênh chào mừng:** ${channel}\n` +
        `💬 **Lời chào tuỳ chỉnh:** \`${message || 'Mặc định'}\`\n\n` +
        `💡 *Biến hỗ trợ: \`{user}\`, \`{username}\`, \`{server}\`, \`{memberCount}\`*\n` +
        `${DIVIDER}`
      )
      .setFooter({ text: `${interaction.guild.name} • Welcome System Active ${EMOJIS.star}` });

    await interaction.reply({ embeds: [embed] });
  }
};
