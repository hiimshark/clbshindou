const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  ChannelType, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const guildService = require('../../database/guildService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Hệ thống Ticket hỗ trợ & CSKH thành viên chuyên nghiệp')
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

      // Bảng Embed Mở Ticket Lộng Lẫy & Chuyên Nghiệp
      const ticketEmbed = CustomEmbed.card(PALETTE.blurple)
        .setAuthor({
          name: `TRUNG TÂM DỊCH VỤ & CHĂM SÓC THÀNH VIÊN`,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTitle('🎫 YÊU CẦU HỖ TRỢ KỸ THUẬT & CSKH 🎫')
        .setDescription(
          `Chào mừng bạn đến với kênh hỗ trợ chính thức của **${interaction.guild.name}**!\n\n` +
          `${DIVIDER}\n` +
          `📌 **HƯỚNG DẪN MỞ TICKET:**\n` +
          `• Nhấn vào nút **[📩 Mở Ticket Hỗ Trợ]** màu xanh bên dưới.\n` +
          `• Nhập lý do hoặc vấn đề bạn cần giải quyết vào khung popup.\n` +
          `• Hệ thống sẽ tạo một kênh chat riêng tư hoàn toàn chỉ giữa bạn và Ban Quản Trị.\n\n` +
          `⏱️ **THỜI GIAN LÀM VIỆC & PHẢN HỒI:**\n` +
          `• Đội ngũ Admin & Staff sẽ phản hồi bạn trong thời gian sớm nhất!\n\n` +
          `⚠️ **NỘI QUY CHUNG:**\n` +
          `• Vui lòng mô tả vấn đề rõ ràng, gửi kèm ảnh chụp màn hình nếu có.\n` +
          `• Nghiêm cấm tạo ticket với mục đích quấy rối, quảng cáo hoặc spam.\n` +
          `${DIVIDER}`
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 256 }))
        .setFooter({ 
          text: `${interaction.guild.name} Support System • Luôn sẵn sàng đồng hành cùng bạn! 💖`, 
          iconURL: interaction.guild.iconURL({ dynamic: true }) 
        });

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
          `✅ Đã gửi bảng mở ticket thành công vào kênh ${channel}!\n\n` +
          `📁 **Danh mục:** ${category ? `\`${category.name}\`` : '*(Mặc định)*'}\n` +
          `🛡️ **Vai trò Staff:** ${staffRole ? `${staffRole}` : '*(Chưa đặt)*'}\n` +
          `📑 **Kênh Log Transcript:** ${logChannel ? `${logChannel}` : '*(Chưa đặt)*'}`
        )],
        ephemeral: true
      });
    }

    if (subcommand === 'close') {
      const ticket = guildService.getTicket(interaction.channelId);
      if (!ticket) {
        return interaction.reply({
          embeds: [CustomEmbed.error('Lỗi Thao Tác', 'Lệnh này chỉ có thể sử dụng bên trong các kênh Ticket đang mở!')],
          ephemeral: true
        });
      }

      guildService.closeTicket(interaction.channelId);

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_transcript')
          .setLabel('Lưu Transcript')
          .setEmoji('📑')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('ticket_delete')
          .setLabel('Xóa Kênh Ngay')
          .setEmoji('🗑️')
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({
        embeds: [CustomEmbed.warning(
          'Ticket Đã Đóng',
          `Ticket này đã được đóng lại bởi ${interaction.user}.\n` +
          `Kênh đã chuyển sang chế độ khóa. Bạn có thể xuất file nhật ký hoặc xóa kênh vĩnh viễn.`
        )],
        components: [closeRow]
      });
    }
  }
};
