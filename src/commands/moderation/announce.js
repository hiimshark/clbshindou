const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

const COLOR_MAP = {
  blue: 0x5865F2,
  green: 0x57F287,
  red: 0xED4245,
  yellow: 0xFEE75C,
  purple: 0x9B59B6
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
          { name: 'Tím', value: 'purple' }
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

    const embed = new CustomEmbed()
      .setColor(COLOR_MAP[colorKey] || COLOR_MAP.blue)
      .setTitle(`📢 ${title}`)
      .setDescription(content)
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setFooter({
        text: `Đăng bởi ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
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
        embeds: [CustomEmbed.success('Thành Công', `Đã gửi thông báo thành công đến kênh ${channel}!`)],
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
