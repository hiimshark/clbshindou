const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const EMOJIS = require('../../utils/emojis');
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

      const embed = CustomEmbed.card(PALETTE.emerald)
        .setTitle(`${EMOJIS.party} Đấu Trường Nối Từ Tiếng Việt Đã Sẵn Sàng!`)
        .setDescription(
          `${DIVIDER}\n` +
          `🎮 Kênh ${channel} đã được kích hoạt làm **Đấu Trường Nối Từ Tiếng Việt**!\n\n` +
          `📜 **Luật Chơi Chuẩn:**\n` +
          `${EMOJIS.sparkle} Mỗi cụm từ phải có **đúng 2 tiếng** (Ví dụ: \`con mèo\`).\n` +
          `${EMOJIS.sparkle} Tiếng đầu của từ sau phải trùng với tiếng cuối của từ trước (\`con mèo\` ➔ \`mèo mướp\`).\n` +
          `${EMOJIS.sparkle} Từ vựng phải có nghĩa trong **Từ điển Tiếng Việt** (>50.000 từ).\n` +
          `${EMOJIS.sparkle} Một người không được tự nối 2 lượt liên tiếp.\n` +
          `${EMOJIS.sparkle} Không được dùng lại từ đã xuất hiện trong chuỗi hiện tại.\n\n` +
          `👉 *Gửi 1 từ 2 tiếng bất kỳ vào kênh này để bắt đầu chuỗi ngay bây giờ!*\n` +
          `${DIVIDER}`
        )
        .setFooter({ text: `Hệ thống kiểm duyệt từ điển tự động 24/7` });

      await channel.send({ embeds: [embed] });
      return interaction.reply({
        content: `${EMOJIS.blueTick} Đã thiết lập kênh nối từ thành công tại ${channel}!`,
        ephemeral: true
      });
    }

    if (subcommand === 'stats') {
      const data = guildService.getWordChainData(interaction.guildId);

      const channelText = data.channelId ? `<#${data.channelId}>` : 'Chưa thiết lập';
      const lastUser = data.lastUserId ? `<@${data.lastUserId}>` : 'Chưa có';

      const embed = CustomEmbed.card(PALETTE.amethyst)
        .setTitle(`${EMOJIS.party} Bảng Thống Kê Nối Từ Tiếng Việt`)
        .setDescription(
          `${DIVIDER}\n` +
          `📍 **Kênh đấu trường:** ${channelText}\n` +
          `🔥 **Chuỗi hiện tại:** \`${data.streak}\` từ liên tiếp\n` +
          `🏆 **Kỷ lục cao nhất:** \`${data.maxStreak}\` từ\n` +
          `${EMOJIS.purplePaw} **Từ gần nhất:** ${data.lastWord ? `\`${data.lastWord}\`` : 'Chưa có'}\n` +
          `${EMOJIS.crownOwner} **Người nối gần nhất:** ${lastUser}\n` +
          `📚 **Tổng từ đã nối:** \`${data.usedWords.length}\` từ vựng\n` +
          `${DIVIDER}\n` +
          `💡 *Gửi từ 2 tiếng vào ${channelText} để tiếp tục nâng cao chuỗi điểm!*`
        )
        .setFooter({ text: `${interaction.guild.name} • Minigame Nối Từ`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

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
