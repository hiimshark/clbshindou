const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Điều chỉnh âm lượng phát nhạc của bot')
    .addIntegerOption(opt =>
      opt.setName('percent')
        .setDescription('Mức âm lượng từ 1% đến 100%')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue) {
      return interaction.reply({
        embeds: [CustomEmbed.warning('Thông Báo', 'Hiện không có bài hát nào đang phát!')],
        ephemeral: true
      });
    }

    const percent = interaction.options.getInteger('percent');
    queue.setVolume(percent);

    return interaction.reply({
      embeds: [CustomEmbed.success('Âm Lượng Đã Cập Nhật', `🔊 Đã chỉnh âm lượng phát nhạc thành **${percent}%**`)]
    });
  }
};
