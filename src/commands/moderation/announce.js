const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const EMOJIS = require('../../utils/emojis');

const COLOR_MAP = {
  blue: PALETTE.blurple,
  green: PALETTE.emerald,
  red: PALETTE.ruby,
  yellow: PALETTE.amber,
  purple: PALETTE.amethyst,
  cyan: PALETTE.cyan
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Tạo và gửi thông báo chuyên nghiệp dạng Embed đến một kênh chỉ định')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Kênh sẽ nhận thông báo')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    )
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Tiêu đề của thông báo')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('content')
        .setDescription('Nội dung chi tiết của thông báo (hỗ trợ Markdown)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Màu sắc đường viền Embed')
        .setRequired(false)
        .addChoices(
          { name: 'Xanh Lam (Mặc định)', value: 'blue' },
          { name: 'Xanh Lá', value: 'green' },
          { name: 'Đỏ', value: 'red' },
          { name: 'Vàng', value: 'yellow' },
          { name: 'Tím', value: 'purple' },
          { name: 'Xanh Cyan', value: 'cyan' }
        )
    )
    .addStringOption(option =>
      option.setName('ping')
        .setDescription('Nhắc tên thành viên khi gửi thông báo')
        .setRequired(false)
        .addChoices(
          { name: 'Không ping ai', value: 'none' },
          { name: 'Ping @everyone', value: 'everyone' },
          { name: 'Ping @here', value: 'here' }
        )
    )
    .addStringOption(option =>
      option.setName('image')
        .setDescription('Đường link ảnh minh họa (URL)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title');
    const content = interaction.options.getString('content').replace(/\\n/g, '\n');
    const colorKey = interaction.options.getString('color') || 'blue';
    const pingType = interaction.options.getString('ping') || 'none';
    const imageUrl = interaction.options.getString('image');

    const embed = CustomEmbed.card(COLOR_MAP[colorKey] || PALETTE.blurple)
      .setAuthor({
        name: `THÔNG BÁO TỪ BAN QUẢN TRỊ • ${interaction.guild.name.toUpperCase()}`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTitle(`${EMOJIS.crownPink} ${title} ${EMOJIS.sparkle}`)
      .setDescription(
        `${DIVIDER}\n\n` +
        `${content}\n\n` +
        `${DIVIDER}`
      )
      .addFields(
        { name: `${EMOJIS.crownOwner} Người đăng`, value: `${interaction.user} (\`${interaction.user.tag}\`)`, inline: true },
        { name: `${EMOJIS.pin} Thời gian`, value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
      )
      .setFooter({
        text: `${interaction.guild.name} Official Announcement • Hãy tương tác nếu bạn đã đọc nhé!`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      });

    if (imageUrl) {
      embed.setImage(imageUrl);
    }

    let pingContent = '';
    if (pingType === 'everyone') pingContent = '@everyone';
    if (pingType === 'here') pingContent = '@here';

    try {
      await channel.send({
        content: pingContent || undefined,
        embeds: [embed]
      });

      await interaction.reply({
        embeds: [CustomEmbed.success('Gửi Thông Báo Thành Công', `${EMOJIS.blueTick} Đã đăng thông báo thành công vào kênh ${channel}!`)],
        ephemeral: true
      });
    } catch (err) {
      await interaction.reply({
        embeds: [CustomEmbed.error('Lỗi Gửi Thông Báo', err.message)],
        ephemeral: true
      });
    }
  }
};
