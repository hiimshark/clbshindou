const { EmbedBuilder } = require('discord.js');
const { config } = require('../config');

class CustomEmbed extends EmbedBuilder {
  constructor() {
    super();
    this.setColor(config.defaultColor);
    this.setTimestamp();
  }

  static success(title, description) {
    const embed = new CustomEmbed()
      .setColor(config.successColor)
      .setTitle(`✅ ${title}`);
    if (description) embed.setDescription(description);
    return embed;
  }

  static error(title, description) {
    const embed = new CustomEmbed()
      .setColor(config.errorColor)
      .setTitle(`❌ ${title}`);
    if (description) embed.setDescription(description);
    return embed;
  }

  static warning(title, description) {
    const embed = new CustomEmbed()
      .setColor(config.warningColor)
      .setTitle(`⚠️ ${title}`);
    if (description) embed.setDescription(description);
    return embed;
  }

  static info(title, description) {
    const embed = new CustomEmbed()
      .setColor(config.defaultColor)
      .setTitle(`ℹ️ ${title}`);
    if (description) embed.setDescription(description);
    return embed;
  }
}

module.exports = CustomEmbed;
