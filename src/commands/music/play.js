const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { config } = require('../../config');
const CustomEmbed = require('../../utils/embedBuilder');
const { searchYouTube } = require('../../utils/ytPlugin');

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

    const botVoice = interaction.guild.members.me?.voice?.channel;
    const isAdmin = interaction.member?.roles?.cache?.has(config.roles.admin) || 
                    interaction.member?.permissions?.has(PermissionFlagsBits.Administrator) ||
                    interaction.guild?.ownerId === interaction.user.id;

    if (botVoice && botVoice.id !== voiceChannel.id) {
      if (!isAdmin) {
        return interaction.reply({
          embeds: [CustomEmbed.error(
            'Phòng Thoại Không Hợp Lệ',
            `🚫 **BOT ĐANG Ở ROOM KHÁC, CHỈ ADMIN MỚI ĐƯỢC KÉO BOT NHẠC!**\n\n` +
            `📍 Bot hiện đang ở phòng: ${botVoice}\n` +
            `💡 Bạn vui lòng tham gia vào ${botVoice} để cùng thưởng thức nhạc nhé!`
          )],
          ephemeral: true
        });
      }
    }

    await interaction.deferReply();

    let target = query.trim();
    const isUrl = /^https?:\/\//i.test(target);

    // Nếu người dùng nhập tên bài hát, tìm chính xác video YouTube gốc trong < 1s
    if (!isUrl) {
      const ytUrl = await searchYouTube(target);
      if (ytUrl) {
        target = ytUrl;
      }
    }

    try {
      await client.distube.play(voiceChannel, target, {
        member: interaction.member,
        textChannel: interaction.channel
      });

      return interaction.editReply({
        embeds: [CustomEmbed.success('Đã Nhận Bài Hát', `🎵 Đã nạp yêu cầu: **${query}**\n⚡ Nhạc đang bắt đầu phát vào phòng thoại của bạn!`)]
      });
    } catch (err) {
      return interaction.editReply({
        embeds: [CustomEmbed.error('Lỗi Phát Nhạc', `Không thể phát bài hát này: \`${err.message}\``)]
      });
    }
  }
};
