const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { config } = require('../../config');
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

    let finalQuery = query.trim();

    // Tự động phân giải link YouTube thành tiêu đề bài hát qua API YouTube chính thức siêu tốc (chống lỗi 429 Cloud IP)
    if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(finalQuery)) {
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(finalQuery)}&format=json`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            finalQuery = data.title;
          }
        }
      } catch {
        // Fallback giữ nguyên link nếu mạng chậm
      }
    }

    try {
      await client.distube.play(voiceChannel, finalQuery, {
        member: interaction.member,
        textChannel: interaction.channel
      });

      return interaction.editReply({
        embeds: [CustomEmbed.success('Đã Nhận Bài Hát', `🎵 Đã nạp yêu cầu: **${finalQuery}**\n⚡ Nhạc đang bắt đầu phát vào phòng thoại của bạn!`)]
      });
    } catch (err) {
      return interaction.editReply({
        embeds: [CustomEmbed.error('Lỗi Phát Nhạc', `Không thể phát bài hát này: \`${err.message}\``)]
      });
    }
  }
};
