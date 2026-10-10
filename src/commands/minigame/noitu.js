const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const guildService = require('../../database/guildService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('noitu')
    .setDescription('Quản lý và theo dõi minigame Nối từ Tiếng Việt')
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Chỉ định kênh làm đấu trường Nối từ')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Kênh sẽ chơi nối từ')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand(sub =>
      sub.setName('stats')
        .setDescription('Xem thống kê điểm streak và kỷ lục nối từ của máy chủ')
    )
    .addSubcommand(sub =>
      sub.setName('reset')
        .setDescription('Reset chuỗi nối từ hiện tại về 0 (Dành cho Quản trị viên)')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({
          embeds: [CustomEmbed.error('Lỗi Phân Quyền', 'Bạn cần có quyền Quản lý máy chủ (Manage Server) để dùng lệnh này!')],
          ephemeral: true
        });
      }

      const channel = interaction.options.getChannel('channel');
      guildService.setWordChainChannel(interaction.guildId, channel.id);

      const embed = CustomEmbed.success(
        'Đã Kích Hoạt Kênh Nối Từ!',
        `🎮 Kênh ${channel} đã được chọn làm kênh chơi **Minigame Nối Từ Tiếng Việt**!\n\n` +
        `📜 **Luật chơi:**\n` +
        `1. Mỗi từ gửi vào phải có **đúng 2 tiếng** (Ví dụ: \`con mèo\`).\n` +
        `2. Từ sau phải bắt đầu bằng tiếng cuối của từ trước (\`con mèo\` -> \`mèo mướp\`).\n` +
        `3. Từ phải có nghĩa trong **Từ điển Tiếng Việt** (>50.000 từ).\n` +
        `4. Một người không được tự nối 2 lượt liên tiếp.\n` +
        `5. Không lặp lại từ đã xuất hiện trong chuỗi hiện tại.\n\n` +
        `👉 Hãy vào ${channel} và gửi một cụm từ 2 tiếng bất kỳ để bắt đầu chuỗi!`
      );

      await channel.send({ embeds: [embed] });
      return interaction.reply({
        content: `✅ Đã thiết lập kênh nối từ thành công tại ${channel}!`,
        ephemeral: true
      });
    }

    if (subcommand === 'stats') {
      const data = guildService.getWordChainData(interaction.guildId);

      const channelText = data.channelId ? `<#${data.channelId}>` : 'Chưa thiết lập';
      const lastUser = data.lastUserId ? `<@${data.lastUserId}>` : 'Chưa có';

      const embed = CustomEmbed.info('Bảng Thống Kê Nối Từ Tiếng Việt')
        .addFields(
          { name: '📍 Kênh đấu trường', value: channelText, inline: true },
          { name: '🔥 Chuỗi hiện tại', value: `\`${data.streak}\` từ`, inline: true },
          { name: '🏆 Kỷ lục cao nhất', value: `\`${data.maxStreak}\` từ`, inline: true },
          { name: '📝 Từ gần nhất', value: data.lastWord ? `\`${data.lastWord}\`` : 'Chưa có', inline: true },
          { name: '👤 Người nối gần nhất', value: lastUser, inline: true },
          { name: '📚 Số từ trong chuỗi này', value: `\`${data.usedWords.length}\` từ`, inline: true }
        );

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === 'reset') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({
          embeds: [CustomEmbed.error('Lỗi Phân Quyền', 'Bạn cần có quyền Quản lý máy chủ để reset chuỗi!')],
          ephemeral: true
        });
      }

      guildService.resetWordChainStreak(interaction.guildId);
      return interaction.reply({
        embeds: [CustomEmbed.success('Đã Reset Chuỗi', 'Chuỗi nối từ hiện tại đã được đưa về 0. Bất kỳ ai cũng có thể mở đầu chuỗi mới!')]
      });
    }
  }
};
