const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Xem và tải avatar ảnh đại diện chất lượng cao của thành viên')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Thành viên cần xem ảnh đại diện (để trống nếu xem của bản thân)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Loại avatar cần xem')
        .setRequired(false)
        .addChoices(
          { name: 'Avatar Tài Khoản (Global)', value: 'global' },
          { name: 'Avatar Máy Chủ (Server)', value: 'server' }
        )
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const type = interaction.options.getString('type') || 'global';
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    let avatarUrl = targetUser.displayAvatarURL({ dynamic: true, size: 1024 });
    let title = `Ảnh đại diện của ${targetUser.username}`;

    if (type === 'server' && member && member.avatar) {
      avatarUrl = member.avatarURL({ dynamic: true, size: 1024 });
      title = `Ảnh đại diện máy chủ của ${member.displayName}`;
    }

    const embed = CustomEmbed.info(title)
      .setImage(avatarUrl)
      .setFooter({ text: `Yêu cầu bởi ${interaction.user.tag}` });

    const linkRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Mở Ảnh Gốc')
        .setStyle(ButtonStyle.Link)
        .setURL(avatarUrl)
    );

    await interaction.reply({ embeds: [embed], components: [linkRow] });
  }
};
