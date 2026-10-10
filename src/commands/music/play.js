const { SlashCommandBuilder } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Phát bài hát hoặc danh sách phát từ YouTube, Spotify hoặc SoundCloud')
    .addStringOption(opt =>
      opt.setName('query')
        .setDescription('Tên bài hát hoặc đường link (YouTube / Spotify / SoundCloud)')
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi', 'Bạn phải tham gia vào một kênh thoại (Voice Channel) trước khi dùng lệnh này!')],
        ephemeral: true
      });
    }

    const botVoice = interaction.guild.members.me.voice.channel;
    if (botVoice && botVoice.id !== voiceChannel.id) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi', `Bot đang phát nhạc tại phòng khác (${botVoice})! Vui lòng tham gia cùng phòng.`)],
        ephemeral: true
      });
    }

    await interaction.deferReply();

    try {
      await client.distube.play(voiceChannel, query, {
        member: interaction.member,
        textChannel: interaction.channel
      });

      return interaction.editReply({
        embeds: [CustomEmbed.info('Đang Tìm Kiếm & Nạp Bài Hát', `🔍 Đang tải bài hát theo yêu cầu: **${query}**...`)]
      });
    } catch (err) {
      return interaction.editReply({
        embeds: [CustomEmbed.error('Lỗi Phát Nhạc', `Không thể phát bài hát này: \`${err.message}\``)]
      });
    }
  }
};
