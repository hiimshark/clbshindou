const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { CustomYtDlpPlugin } = require('../utils/ytPlugin');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbed = require('../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../utils/embedBuilder');
const EMOJIS = require('../utils/emojis');
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
      .setLabel('Lặp bài')
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
    ffmpeg: {
      args: {
        global: {
          loglevel: 'warning'
        },
        input: {
          reconnect: 1,
          reconnect_streamed: 1,
          reconnect_at_eof: 1,
          reconnect_delay_max: 5,
          rw_timeout: 15000000,
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    },
    plugins: [
      new SpotifyPlugin(),
      new CustomYtDlpPlugin(),
      new SoundCloudPlugin()
    ]
  });

  // Tăng bộ đệm khung hình voice chống giật lag âm thanh (từ 5 frames = 100ms lên 250 frames = 5s)
  const originalVoiceCreate = distube.voices.create.bind(distube.voices);
  distube.voices.create = function(channel) {
    const voice = originalVoiceCreate(channel);
    if (voice.audioPlayer?.behaviors) {
      voice.audioPlayer.behaviors.maxMissedFrames = 250;
    }
    return voice;
  };

  distube.on('initQueue', queue => {
    if (queue.voice?.audioPlayer?.behaviors) {
      queue.voice.audioPlayer.behaviors.maxMissedFrames = 250;
    }
  });

  client.distube = distube;

  // 1. KHI BÀI HÁT BẮT ĐẦU PHÁT (NOW PLAYING EMBED TUYỆT ĐẸP)
  distube.on('playSong', (queue, song) => {
    logger.music(`Đang phát: "${song.name}" tại ${queue.textChannel?.guild?.name}`);
    const embed = CustomEmbed.card(PALETTE.emerald)
      .setAuthor({
        name: `TRÌNH PHÁT NHẠC CAO CẤP • SHINDOU AUDIO`,
        iconURL: queue.textChannel?.guild?.iconURL({ dynamic: true })
      })
      .setTitle(`${EMOJIS.spotify} Đang Phát: ${song.name}`)
      .setURL(song.url)
      .setDescription(
        `${DIVIDER}\n` +
        `🎵 **Bài hát:** [${song.name}](${song.url})\n` +
        `⏱️ **Thời lượng:** \`${song.formattedDuration}\`\n` +
        `${EMOJIS.crownOwner} **Yêu cầu bởi:** ${song.user}\n` +
        `🔊 **Âm lượng:** \`${queue.volume}%\` | 🔁 **Chế độ lặp:** \`${queue.repeatMode ? (queue.repeatMode === 2 ? 'Cả hàng đợi' : 'Bài hiện tại') : 'Tắt'}\`\n` +
        `${DIVIDER}\n` +
        `💡 *Sử dụng các nút điều khiển bên dưới để tương tác trực tiếp!*`
      )
      .setFooter({ text: `${queue.textChannel?.guild?.name} • Âm thanh 320kbps chất lượng cao ${EMOJIS.star}` });

    if (song.thumbnail) embed.setThumbnail(song.thumbnail);

    const row = createMusicButtons();
    queue.textChannel?.send({ embeds: [embed], components: [row] }).catch(err => {
      logger.error('Lỗi khi gửi thông báo playSong:', err.message);
    });
  });

  // 2. KHI THÊM 1 BÀI HÁT
  distube.on('addSong', (queue, song) => {
    logger.music(`Đã thêm bài hát: "${song.name}"`);
    const embed = CustomEmbed.card(PALETTE.cyan)
      .setTitle(`${EMOJIS.blueTick} Đã Thêm Vào Hàng Đợi!`)
      .setDescription(
        `${DIVIDER}\n` +
        `🎶 **[${song.name}](${song.url})**\n` +
        `⏱️ Thời lượng: \`${song.formattedDuration}\` | ${EMOJIS.purplePaw} Người yêu cầu: ${song.user}\n` +
        `${DIVIDER}`
      );
    if (song.thumbnail) embed.setThumbnail(song.thumbnail);
    queue.textChannel?.send({ embeds: [embed] }).catch(() => {});
  });

  // 3. KHI THÊM PLAYLIST
  distube.on('addList', (queue, playlist) => {
    logger.music(`Đã thêm playlist: "${playlist.name}" (${playlist.songs.length} bài)`);
    const embed = CustomEmbed.card(PALETTE.amethyst)
      .setTitle(`${EMOJIS.party} Đã Thêm Danh Sách Phát (Playlist)!`)
      .setDescription(
        `${DIVIDER}\n` +
        `📁 **Playlist:** [${playlist.name}](${playlist.url})\n` +
        `🔢 Số lượng bài: \`${playlist.songs.length}\` bài hát\n` +
        `${EMOJIS.crownOwner} Yêu cầu bởi: ${playlist.user}\n` +
        `${DIVIDER}`
      );
    if (playlist.thumbnail) embed.setThumbnail(playlist.thumbnail);
    queue.textChannel?.send({ embeds: [embed] }).catch(() => {});
  });

  distube.on('error', (error, queue, song) => {
    logger.error('Lỗi DisTube:', error?.message || error);
    const textChannel = queue?.textChannel;
    if (textChannel?.send) {
      textChannel.send({
        embeds: [CustomEmbed.error('Lỗi Phát Nhạc', `Đã xảy ra sự cố: \`${(error?.message || error).toString().slice(0, 200)}\``)]
      }).catch(() => {});
    }
  });

  distube.on('finish', queue => {
    logger.music(`Đã phát xong toàn bộ hàng đợi tại ${queue.textChannel?.guild?.name}`);
    queue.textChannel?.send({
      embeds: [CustomEmbed.info('Hết Danh Sách', `${EMOJIS.star} Đã phát hết toàn bộ bài hát trong hàng đợi!`)]
    }).catch(() => {});
  });

  distube.on('disconnect', queue => {
    logger.music(`Đã ngắt kết nối voice tại ${queue.textChannel?.guild?.name}`);
  });

  logger.info('Hệ thống âm nhạc DisTube đã sẵn sàng với YouTube, Spotify và SoundCloud!');
  return distube;
}

module.exports = {
  initMusic,
  createMusicButtons
};
