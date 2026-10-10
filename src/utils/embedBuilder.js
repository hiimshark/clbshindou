const { EmbedBuilder } = require('discord.js');
const { config } = require('../config');

const PALETTE = {
  blurple: 0x5865F2,
  emerald: 0x2ECC71,
  ruby: 0xED4245,
  amber: 0xF1C40F,
  amethyst: 0x9B59B6,
  cyan: 0x00D2D3,
  midnight: 0x2C3E50,
  dark: 0x2F3136
};

const DIVIDER = '━━━━━━━━━━━━━━━━━━━━━━━━━━';

class CustomEmbed extends EmbedBuilder {
  constructor() {
    super();
    this.setColor(PALETTE.blurple);
    this.setTimestamp();
  }

  static success(title, description) {
    const embed = new CustomEmbed()
      .setColor(PALETTE.emerald)
      .setTitle(`✨ ${title}`);
    if (description) embed.setDescription(`${DIVIDER}\n${description}\n${DIVIDER}`);
    return embed;
  }

  static error(title, description) {
    const embed = new CustomEmbed()
      .setColor(PALETTE.ruby)
      .setTitle(`🚨 ${title}`);
    if (description) embed.setDescription(`${DIVIDER}\n${description}\n${DIVIDER}`);
    return embed;
  }

  static warning(title, description) {
    const embed = new CustomEmbed()
      .setColor(PALETTE.amber)
      .setTitle(`⚠️ ${title}`);
    if (description) embed.setDescription(`${DIVIDER}\n${description}\n${DIVIDER}`);
    return embed;
  }

  static info(title, description) {
    const embed = new CustomEmbed()
      .setColor(PALETTE.blurple)
      .setTitle(`ℹ️ ${title}`);
    if (description) embed.setDescription(`${DIVIDER}\n${description}\n${DIVIDER}`);
    return embed;
  }

  static card(color = PALETTE.blurple) {
    return new CustomEmbed().setColor(color);
  }
}

module.exports = CustomEmbed;
module.exports.PALETTE = PALETTE;
module.exports.DIVIDER = DIVIDER;
