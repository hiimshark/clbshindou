const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const EMOJIS = require('../../utils/emojis');
const guildService = require('../../database/guildService');
const logger = require('../../utils/logger');

module.exports = {
  customId: 'ticket_modal_submit',
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const reason = interaction.fields.getTextInputValue('ticket_reason') || 'Không cung cấp lý do cụ thể';
    const config = guildService.getConfig(interaction.guildId);

    // Permission overwrites
    const permissionOverwrites = [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks
        ]
      },
      {
        id: client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.EmbedLinks
        ]
      }
    ];

    // If staff role is configured, grant staff access
    if (config.ticket_staff_role_id) {
      permissionOverwrites.push({
        id: config.ticket_staff_role_id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles
        ]
      });
    }

    try {
      const cleanUsername = interaction.user.username.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 15) || 'user';
      const channelName = `ticket-${cleanUsername}`;

      const channelOptions = {
        name: channelName,
        type: ChannelType.GuildText,
        permissionOverwrites,
        topic: `Ticket hỗ trợ của ${interaction.user.tag} (${interaction.user.id}) | Lý do: ${reason}`
      };

      if (config.ticket_category_id) {
        const cat = interaction.guild.channels.cache.get(config.ticket_category_id);
        if (cat && cat.type === ChannelType.GuildCategory) {
          channelOptions.parent = config.ticket_category_id;
        }
      }

      const ticketChannel = await interaction.guild.channels.create(channelOptions);

      // Save to Database
      guildService.createTicket(ticketChannel.id, interaction.guildId, interaction.user.id, reason);

      // Buttons inside ticket channel
      const controlRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel('Đóng Ticket')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('ticket_transcript')
          .setLabel('Lưu Transcript')
          .setEmoji('📑')
          .setStyle(ButtonStyle.Secondary)
      );

      const welcomeEmbed = CustomEmbed.card(PALETTE.cyan)
        .setAuthor({
          name: `YÊU CẦU HỖ TRỢ RIÊNG TƯ`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTitle(`${EMOJIS.crownPink} Phòng Hỗ Trợ: #${channelName} ${EMOJIS.sparkle}`)
        .setDescription(
          `Xin chào ${interaction.user}! Yêu cầu hỗ trợ của bạn đã được chuyển tới Ban Quản Trị.\n\n` +
          `${DIVIDER}\n` +
          `📝 **CHI TIẾT VẤN ĐỀ CỦA BẠN:**\n` +
          `> *${reason}*\n\n` +
          `${EMOJIS.purplePaw} **Người tạo ticket:** ${interaction.user} (\`${interaction.user.id}\`)\n` +
          `${EMOJIS.vip} **Đội ngũ tiếp nhận:** ${config.ticket_staff_role_id ? `<@&${config.ticket_staff_role_id}>` : 'Ban Quản Trị'}\n` +
          `⏰ **Thời gian mở:** <t:${Math.floor(Date.now() / 1000)}:F>\n` +
          `${DIVIDER}\n` +
          `💡 *Vui lòng gửi mô tả chi tiết, hình ảnh hoặc video bằng chứng để được xử lý nhanh nhất.*\n` +
          `*Khi vấn đề đã được giải quyết, nhấn nút **[🔒 Đóng Ticket]** phía dưới!*`
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({ text: `Hệ thống hỗ trợ bảo mật • ${interaction.guild.name}` });

      await ticketChannel.send({
        content: `${interaction.user} ${config.ticket_staff_role_id ? `<@&${config.ticket_staff_role_id}>` : ''}`,
        embeds: [welcomeEmbed],
        components: [controlRow]
      });

      logger.ticket(`Tạo ticket mới: ${channelName} (${ticketChannel.id}) cho user ${interaction.user.tag}`);

      return interaction.editReply({
        content: `${EMOJIS.blueTick} Ticket hỗ trợ của bạn đã được khởi tạo thành công! Hãy bấm vào đây để chuyển tới kênh: <#${ticketChannel.id}>`
      });
    } catch (err) {
      logger.error('Lỗi khi tạo kênh ticket:', err);
      return interaction.editReply({
        embeds: [CustomEmbed.error('Lỗi Tạo Kênh', `Không thể tạo kênh ticket: \`${err.message}\``)]
      });
    }
  }
};
