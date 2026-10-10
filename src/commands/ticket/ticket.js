const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  ChannelType, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const guildService = require('../../database/guildService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Hệ thống Ticket hỗ trợ thành viên chuyên nghiệp')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('setup')
        .setDescription('Tạo bảng tin Mở Ticket cố định trong một kênh chỉ định')
        .addChannelOption(opt =>
          opt.setName('channel')
            .setDescription('Kênh sẽ đặt bảng tạo ticket')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addChannelOption(opt =>
          opt.setName('category')
            .setDescription('Danh mục (Category) sẽ chứa các kênh ticket được tạo')
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildCategory)
        )
        .addRoleOption(opt =>
          opt.setName('staff_role')
            .setDescription('Vai trò nhân viên hỗ trợ (Staff) được phép xem ticket')
            .setRequired(false)
        )
        .addChannelOption(opt =>
          opt.setName('log_channel')
            .setDescription('Kênh lưu trữ transcript lịch sử ticket sau khi đóng')
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand(sub =>
      sub.setName('close')
        .setDescription('Đóng ticket hiện tại (sử dụng bên trong kênh ticket)')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') {
      const channel = interaction.options.getChannel('channel');
      const category = interaction.options.getChannel('category');
      const staffRole = interaction.options.getRole('staff_role');
      const logChannel = interaction.options.getChannel('log_channel');

      // Save to database
      guildService.setTicketConfig(interaction.guildId, {
        categoryId: category ? category.id : null,
        staffRoleId: staffRole ? staffRole.id : null,
        logChannelId: logChannel ? logChannel.id : null
      });

      // Create permanent ticket button embed
      const ticketEmbed = new CustomEmbed()
        .setColor(0x5865F2)
        .setTitle('🎫 Trung Tâm Hỗ Trợ Thành Viên')
        .setDescription(
          'Chào mừng bạn đến với hệ thống hỗ trợ!\n\n' +
          '• Nhấn vào nút **[📩 Mở Ticket]** bên dưới để tạo một kênh trao đổi riêng tư với đội ngũ quản trị.\n' +
          '• Vui lòng mô tả rõ ràng vấn đề hoặc thắc mắc của bạn khi được yêu cầu.\n' +
          '• Nghiêm cấm tạo ticket với mục đích quấy rối, spam.'
        )
        .setFooter({ text: `${interaction.guild.name} • Support System`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

      const ticketRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_open')
          .setLabel('Mở Ticket Hỗ Trợ')
          .setEmoji('📩')
          .setStyle(ButtonStyle.Primary)
      );

      await channel.send({ embeds: [ticketEmbed], components: [ticketRow] });

      return interaction.reply({
        embeds: [CustomEmbed.success(
          'Thiết Lập Ticket Hoàn Tất',
          `✅ Đã gửi bảng tạo ticket thành công vào kênh ${channel}!\n` +
          `📁 **Danh mục:** ${category ? category.name : 'Mặc định'}\n` +
          `🛡️ **Vai trò Staff:** ${staffRole ? staffRole : 'Chưa thiết lập'}\n` +
          `📑 **Kênh Log Transcript:** ${logChannel ? logChannel : 'Chưa thiết lập'}`
        )],
        ephemeral: true
      });
    }

    if (subcommand === 'close') {
      const ticket = guildService.getTicket(interaction.channelId);
      if (!ticket) {
        return interaction.reply({
          embeds: [CustomEmbed.error('Lỗi', 'Lệnh này chỉ có thể sử dụng bên trong các kênh Ticket!')],
          ephemeral: true
        });
      }

      // Close ticket via service and notify
      guildService.closeTicket(interaction.channelId);

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_transcript')
          .setLabel('Lưu Transcript')
          .setEmoji('📑')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('ticket_delete')
          .setLabel('Xóa Kênh')
          .setEmoji('🗑️')
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({
        embeds: [CustomEmbed.warning(
          'Ticket Đã Đóng',
          `Ticket đã được đóng bởi ${interaction.user}.\n` +
          `Bạn có thể lưu **Transcript** hoặc **Xóa Kênh** ngay bây giờ.`
        )],
        components: [closeRow]
      });
    }
  }
};
