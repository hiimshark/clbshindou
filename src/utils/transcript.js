const fs = require('fs');
const path = require('path');

const transcriptUtil = {
  /**
   * Generates a clean text/markdown transcript of channel messages
   */
  async generateTextTranscript(channel, limit = 100) {
    const messages = await channel.messages.fetch({ limit });
    const sorted = Array.from(messages.values()).reverse();

    let output = `========================================================\n`;
    output += `TRANSCRIPT TICKET: #${channel.name}\n`;
    output += `Guild: ${channel.guild.name} (${channel.guild.id})\n`;
    output += `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}\n`;
    output += `Tổng số tin nhắn: ${sorted.length}\n`;
    output += `========================================================\n\n`;

    for (const msg of sorted) {
      const time = msg.createdAt.toLocaleString('vi-VN');
      const author = `${msg.author.tag} (${msg.author.id})`;
      output += `[${time}] ${author}:\n`;
      if (msg.content) {
        output += `  ${msg.content}\n`;
      }
      if (msg.attachments.size > 0) {
        msg.attachments.forEach(att => {
          output += `  [File đính kèm: ${att.url}]\n`;
        });
      }
      if (msg.embeds.length > 0) {
        output += `  [Có ${msg.embeds.length} Embeds]\n`;
      }
      output += `\n`;
    }

    return Buffer.from(output, 'utf-8');
  }
};

module.exports = transcriptUtil;
