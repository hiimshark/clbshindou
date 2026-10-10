const musicButtons = require('../components/buttons/musicButtons');
const ticketButtons = require('../components/buttons/ticketButtons');
const ticketModal = require('../components/modals/ticketModal');
const logger = require('../utils/logger');
const CustomEmbed = require('../utils/embedBuilder');

async function handleInteractionComponents(interaction, client) {
  try {
    // 1. Button interactions
    if (interaction.isButton()) {
      if (interaction.customId.startsWith('music_')) {
        return await musicButtons.execute(interaction, client);
      }
      if (interaction.customId.startsWith('ticket_')) {
        return await ticketButtons.execute(interaction, client);
      }
    }

    // 2. Modal interactions
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'ticket_modal_submit') {
        return await ticketModal.execute(interaction, client);
      }
    }
  } catch (error) {
    logger.error('Lỗi khi điều phối Component interaction:', error);
    const replyOptions = {
      embeds: [CustomEmbed.error('Lỗi Tương Tác', 'Đã xảy ra sự cố khi xử lý tương tác này!')],
      ephemeral: true
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions).catch(() => {});
    } else {
      await interaction.reply(replyOptions).catch(() => {});
    }
  }
}

module.exports = { handleInteractionComponents };
