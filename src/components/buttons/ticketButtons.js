const { 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  AttachmentBuilder, 
  ChannelType, 
  PermissionFlagsBits 
} = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const EMOJIS = require('../../utils/emojis');
const guildService = require('../../database/guildService');
const transcriptUtil = require('../../utils/transcript');
const logger = require('../../utils/logger');

module.exports = {
  customIdPrefix: 'ticket_',
  async execute(interaction, client) {
    const customId = interaction.customId;

    // 1. MỞ TICKET (Hiển thị Modal nhập lý do)
    if (customId === 'ticket_open') {
      const modal = new ModalBuilder()
        .setCustomId('ticket_modal_submit')
        .setTitle('Tạo Yêu Cầu Hỗ Trợ Kỹ Thuật');

      const reasonInput = new TextInputBuilder()
        .setCustomId('ticket_reason')
        .setLabel('Vấn đề bạn cần hỗ trợ là gì?')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Vui lòng mô tả chi tiết sự cố hoặc câu hỏi của bạn tại đây...')
        .setRequired(true)
        .setMaxLength(1000);

      modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
      return interaction.showModal(modal);
    }

    // 2. ĐÓNG TICKET
    if (customId === 'ticket_close') {
      await interaction.deferReply();
      const ticket = guildService.getTicket(interaction.channelId);

      if (!ticket) {
        return interaction.editReply({
          embeds: [CustomEmbed.error('Lỗi Dữ Liệu', 'Kênh này không phải là một ticket hợp lệ trong cơ sở dữ liệu!')]
        });
      }

      // Mark as closed in DB
      guildService.closeTicket(interaction.channelId);

      // Disable sending messages for user
      try {
        await interaction.channel.permissionOverwrites.edit(ticket.user_id, {
          SendMessages: false,
          ViewChannel: true
        });
      } catch (e) {
        logger.warn('Không thể thu hồi quyền gửi tin nhắn của user trong ticket:', e.message);
      }

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_transcript')
          .setLabel('Lưu Transcript')
          .setEmoji('📑')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('ticket_delete')
          .setLabel('Xóa Kênh Vĩnh Viễn')
          .setEmoji('🗑️')
          .setStyle(ButtonStyle.Danger)
      );

      const embed = CustomEmbed.card(PALETTE.ruby)
        .setAuthor({
          name: `TRẠNG THÁI TICKET: ĐÃ ĐÓNG`,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTitle(`${EMOJIS.redTick} Ticket Đã Được Khóa Thành Công!`)
        .setDescription(
          `${DIVIDER}\n` +
          `${EMOJIS.crownOwner} **Người thực hiện đóng:** ${interaction.user} (\`${interaction.user.tag}\`)\n` +
          `⏰ **Thời gian đóng:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
          `📋 **TRẠNG THÁI KÊNH:**\n` +
          `• Thành viên mở ticket đã bị thu hồi quyền gửi tin nhắn mới.\n` +
          `• Bạn có thể nhấn **[📑 Lưu Transcript]** để xuất toàn bộ lịch sử tin nhắn.\n` +
          `• Nhấn **[🗑️ Xóa Kênh Vĩnh Viễn]** khi đã hoàn tất lưu trữ.\n` +
          `${DIVIDER}`
        )
        .setFooter({ text: `${interaction.guild.name} • Ticket Closed` });

      return interaction.editReply({ embeds: [embed], components: [closeRow] });
    }

    // 3. XUẤT TRANSCRIPT
    if (customId === 'ticket_transcript') {
      await interaction.deferReply();
      try {
        const buffer = await transcriptUtil.generateTextTranscript(interaction.channel);
        const attachment = new AttachmentBuilder(buffer, { name: `transcript-${interaction.channel.name}.txt` });

        // Send to channel
        await interaction.editReply({
          content: `${EMOJIS.blueTick} Đã xuất thành công file nhật ký tin nhắn của ticket **#${interaction.channel.name}**:`,
          files: [attachment]
        });

        // Also send to configured log channel if exists
        const config = guildService.getConfig(interaction.guildId);
        if (config.ticket_log_channel_id) {
          const logChannel = interaction.guild.channels.cache.get(config.ticket_log_channel_id);
          if (logChannel) {
            await logChannel.send({
              content: `📑 **Nhật ký Transcript mới từ #${interaction.channel.name}** (Xuất bởi ${interaction.user.tag}):`,
              files: [attachment]
            });
          }
        }
      } catch (err) {
        logger.error('Lỗi khi xuất transcript:', err);
        return interaction.editReply({
          embeds: [CustomEmbed.error('Lỗi Xuất File', 'Không thể tạo file transcript tin nhắn!')]
        });
      }
      return;
    }

    // 4. XÓA KÊNH TICKET
    if (customId === 'ticket_delete') {
      await interaction.reply({
        embeds: [CustomEmbed.warning('Đang Xóa Kênh', `${EMOJIS.sparkle} Kênh hỗ trợ này sẽ tự động bị xóa vĩnh viễn sau **5 giây**... ⏳`)]
      });

      setTimeout(async () => {
        try {
          await interaction.channel.delete(`Ticket deleted by ${interaction.user.tag}`);
        } catch (err) {
          logger.error('Lỗi khi xóa kênh ticket:', err.message);
        }
      }, 5000);
    }
  }
};
