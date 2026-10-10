const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const guildService = require('../../database/guildService');
const logger = require('../../utils/logger');

module.exports = {
  customId: 'ticket_modal_submit',
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const reason = interaction.fields.getTextInputValue('ticket_reason') || 'Không cung cấp lý do';
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

      // Save to SQLite
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

      const welcomeEmbed = CustomEmbed.info(
        `Ticket Hỗ Trợ: #${channelName}`,
        `Xin chào ${interaction.user}! Đội ngũ hỗ trợ sẽ sớm có mặt để giải quyết yêu cầu của bạn.\n\n` +
        `📝 **Lý do yêu cầu:**\n> ${reason}\n\n` +
        `*Nhấn vào nút bên dưới khi bạn đã được hỗ trợ xong hoặc muốn đóng ticket.*`
      );

      await ticketChannel.send({
        content: `${interaction.user} ${config.ticket_staff_role_id ? `<@&${config.ticket_staff_role_id}>` : ''}`,
        embeds: [welcomeEmbed],
        components: [controlRow]
      });

      logger.ticket(`Tạo ticket mới: ${channelName} (${ticketChannel.id}) cho user ${interaction.user.tag}`);

      return interaction.editReply({
        content: `✅ Ticket của bạn đã được tạo thành công tại: <#${ticketChannel.id}>`
      });
    } catch (err) {
      logger.error('Lỗi khi tạo kênh ticket:', err);
      return interaction.editReply({
        embeds: [CustomEmbed.error('Lỗi', `Không thể tạo kênh ticket: \`${err.message}\``)]
      });
    }
  }
};
