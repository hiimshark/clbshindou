const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbed = require('../utils/embedBuilder');
const logger = require('../utils/logger');

function createMusicButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('music_pause')
      .setLabel('Tạm dừng / Tiếp tục')
      .setEmoji('⏯️')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('music_skip')
      .setLabel('Bỏ qua')
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_stop')
      .setLabel('Dừng phát')
      .setEmoji('⏹️')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('music_loop')
      .setLabel('Chế độ lặp')
      .setEmoji('🔁')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('music_queue')
      .setLabel('Hàng đợi')
      .setEmoji('📜')
      .setStyle(ButtonStyle.Secondary)
  );
}

function initMusic(client) {
  const distube = new DisTube(client, {
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    emitAddListWhenCreatingQueue: false,
    plugins: [
      new SpotifyPlugin(),
      new SoundCloudPlugin(),
      new YtDlpPlugin()
    ]
  });

  // Attach distube instance to client
  client.distube = distube;

  // Music Event Listeners
  distube.on('playSong', (queue, song) => {
    logger.music(`Đang phát: "${song.name}" tại ${queue.textChannel?.guild?.name}`);
    const embed = CustomEmbed.info(
      'Đang Phát Nhạc',
      `🎵 **[${song.name}](${song.url})**\n\n` +
      `⏱️ **Thời lượng:** \`${song.formattedDuration}\`\n` +
      `👤 **Yêu cầu bởi:** ${song.user}\n` +
      `🔊 **Âm lượng:** \`${queue.volume}%\` | 🔁 **Lặp:** \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'Cả hàng đợi' : 'Bài hiện tại') : 'Tắt'}\``
    );
    if (song.thumbnail) embed.setThumbnail(song.thumbnail);

    const row = createMusicButtons();
    queue.textChannel?.send({ embeds: [embed], components: [row] }).catch(err => {
      logger.error('Lỗi khi gửi thông báo playSong:', err.message);
    });
  });

  distube.on('addSong', (queue, song) => {
    logger.music(`Đã thêm bài hát: "${song.name}"`);
    const embed = CustomEmbed.success(
      'Đã Thêm Vào Hàng Đợi',
      `🎵 **[${song.name}](${song.url})**\n⏱️ Thời lượng: \`${song.formattedDuration}\` | Yêu cầu: ${song.user}`
    );
    if (song.thumbnail) embed.setThumbnail(song.thumbnail);
    queue.textChannel?.send({ embeds: [embed] }).catch(() => {});
  });

  distube.on('addList', (queue, playlist) => {
    logger.music(`Đã thêm playlist: "${playlist.name}" (${playlist.songs.length} bài)`);
    const embed = CustomEmbed.success(
      'Đã Thêm Playlist Vào Hàng Đợi',
      `🎶 **Playlist:** **[${playlist.name}](${playlist.url})**\n🔢 Số lượng bài: \`${playlist.songs.length}\` bài hát\n👤 Yêu cầu: ${playlist.user}`
    );
    if (playlist.thumbnail) embed.setThumbnail(playlist.thumbnail);
    queue.textChannel?.send({ embeds: [embed] }).catch(() => {});
  });

  distube.on('error', (channel, error) => {
    logger.error('Lỗi DisTube:', error);
    if (channel?.send) {
      channel.send({
        embeds: [CustomEmbed.error('Lỗi Phát Nhạc', `Đã xảy ra lỗi khi phát nhạc: \`${error.message?.slice(0, 200)}\``)]
      }).catch(() => {});
    }
  });

  distube.on('finish', queue => {
    logger.music(`Đã phát xong toàn bộ hàng đợi tại ${queue.textChannel?.guild?.name}`);
    queue.textChannel?.send({
      embeds: [CustomEmbed.info('Hết Nhạc', 'Đã phát hết bài hát trong hàng đợi!')]
    }).catch(() => {});
  });

  distube.on('disconnect', queue => {
    logger.music(`Đã ngắt kết nối voice tại ${queue.textChannel?.guild?.name}`);
  });

  distube.on('empty', queue => {
    logger.music(`Kênh thoại trống, tự động rời phòng tại ${queue.textChannel?.guild?.name}`);
    queue.textChannel?.send({
      embeds: [CustomEmbed.warning('Tiết Kiệm Tài Nguyên', 'Không còn ai trong phòng thoại, bot đã rời phòng để tối ưu tài nguyên Railway!')]
    }).catch(() => {});
  });

  logger.info('Hệ thống âm nhạc DisTube đã sẵn sàng với YouTube, Spotify và SoundCloud!');
  return distube;
}

module.exports = {
  initMusic,
  createMusicButtons
};
