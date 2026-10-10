const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Xóa nhanh một số lượng tin nhắn trong kênh hiện tại')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Số lượng tin nhắn cần xóa (tối đa 100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Chỉ xóa tin nhắn của thành viên này (tùy chọn)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    try {
      const messages = await interaction.channel.messages.fetch({ limit: amount });

      let messagesToDelete = messages;
      if (targetUser) {
        messagesToDelete = messages.filter(m => m.author.id === targetUser.id);
      }

      // Filter out messages older than 14 days due to Discord API limitation
      const deleted = await interaction.channel.bulkDelete(messagesToDelete, true);

      const embed = CustomEmbed.success(
        'Đã Dọn Dẹp Tin Nhắn',
        `Đã xóa thành công **${deleted.size}** tin nhắn trong kênh này!` +
        (targetUser ? `\n(Lọc theo thành viên: ${targetUser})` : '')
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      return interaction.editReply({
        embeds: [CustomEmbed.error('Lỗi Khi Xóa Tin Nhắn', error.message)]
      });
    }
  }
};
