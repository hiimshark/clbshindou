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
        .setTitle('Tạo Yêu Cầu Hỗ Trợ');

      const reasonInput = new TextInputBuilder()
        .setCustomId('ticket_reason')
        .setLabel('Lý do bạn cần hỗ trợ là gì?')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải...')
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
          embeds: [CustomEmbed.error('Lỗi', 'Kênh này không phải là một ticket hợp lệ trong cơ sở dữ liệu!')]
        });
      }

      // Mark as closed in DB
      guildService.closeTicket(interaction.channelId);

      // Disable sending messages for normal members
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
          .setLabel('Xóa Kênh')
          .setEmoji('🗑️')
          .setStyle(ButtonStyle.Danger)
      );

      const embed = CustomEmbed.warning(
        'Ticket Đã Đóng',
        `Ticket đã được đóng bởi ${interaction.user}.\n` +
        `Thành viên tạo ticket không thể gửi tin nhắn mới.\n` +
        `Bạn có thể xuất **Transcript** hoặc **Xóa Kênh** ngay bây giờ.`
      );

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
          content: `✅ Đã xuất lịch sử tin nhắn của ticket:`,
          files: [attachment]
        });

        // Also send to configured log channel if exists
        const config = guildService.getConfig(interaction.guildId);
        if (config.ticket_log_channel_id) {
          const logChannel = interaction.guild.channels.cache.get(config.ticket_log_channel_id);
          if (logChannel) {
            await logChannel.send({
              content: `📑 **Transcript từ #${interaction.channel.name}** (Xuất bởi ${interaction.user.tag}):`,
              files: [attachment]
            });
          }
        }
      } catch (err) {
        logger.error('Lỗi khi xuất transcript:', err);
        return interaction.editReply({
          embeds: [CustomEmbed.error('Lỗi', 'Không thể tạo file transcript tin nhắn!')]
        });
      }
      return;
    }

    // 4. XÓA KÊNH TICKET
    if (customId === 'ticket_delete') {
      await interaction.reply({
        embeds: [CustomEmbed.error('Xóa Ticket', 'Kênh này sẽ tự động bị xóa sau **5 giây**...')]
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
