const { PermissionFlagsBits } = require('discord.js');
const { config } = require('../../config');
const CustomEmbed = require('../../utils/embedBuilder');

module.exports = {
  customIdPrefix: 'music_',
  async execute(interaction, client) {
    const member = interaction.member;
    const isAdmin = member?.roles?.cache?.has(config.roles.admin) || 
                    member?.permissions?.has(PermissionFlagsBits.Administrator) ||
                    interaction.guild?.ownerId === interaction.user.id;
    const hasMusicRole = member?.roles?.cache?.has(config.roles.music);

    if (!isAdmin && !hasMusicRole) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Thiếu Quyền Thao Tác', `Bạn cần có vai trò <@&${config.roles.music}> để điều khiển trình phát nhạc!`)],
        ephemeral: true
      });
    }

    const queue = client.distube.getQueue(interaction.guildId);
    const memberVoiceChannel = interaction.member.voice?.channel;

    if (!memberVoiceChannel) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi', 'Bạn phải ở trong cùng kênh thoại với bot để sử dụng nút bấm!')],
        ephemeral: true
      });
    }

    if (!queue) {
      return interaction.reply({
        embeds: [CustomEmbed.warning('Hết nhạc', 'Hiện tại không có bài hát nào đang phát!')],
        ephemeral: true
      });
    }

    const customId = interaction.customId;

    try {
      switch (customId) {
        case 'music_pause': {
          if (queue.paused) {
            queue.resume();
            return interaction.reply({ embeds: [CustomEmbed.success('Tiếp tục phát', 'Đã tiếp tục phát nhạc!')] });
          } else {
            queue.pause();
            return interaction.reply({ embeds: [CustomEmbed.warning('Tạm dừng', 'Đã tạm dừng bài hát!')] });
          }
        }

        case 'music_skip': {
          if (queue.songs.length <= 1 && !queue.autoplay) {
            return interaction.reply({
              embeds: [CustomEmbed.warning('Không thể bỏ qua', 'Không còn bài hát tiếp theo trong hàng đợi!')],
              ephemeral: true
            });
          }
          const skippedSong = queue.songs[0];
          await queue.skip();
          return interaction.reply({
            embeds: [CustomEmbed.success('Bỏ qua bài hát', `Đã bỏ qua bài: **${skippedSong.name}**`)]
          });
        }

        case 'music_stop': {
          queue.stop();
          return interaction.reply({
            embeds: [CustomEmbed.error('Dừng phát nhạc', 'Đã dừng phát và xóa toàn bộ hàng đợi!')]
          });
        }

        case 'music_loop': {
          let mode = 0;
          let modeName = 'Tắt';
          if (queue.repeatMode === 0) {
            mode = 1;
            modeName = 'Lặp bài hát hiện tại';
          } else if (queue.repeatMode === 1) {
            mode = 2;
            modeName = 'Lặp toàn bộ hàng đợi';
          } else {
            mode = 0;
            modeName = 'Tắt chế độ lặp';
          }
          queue.setRepeatMode(mode);
          return interaction.reply({
            embeds: [CustomEmbed.info('Chế độ lặp', `Đã chuyển chế độ lặp sang: **${modeName}**`)]
          });
        }

        case 'music_queue': {
          const list = queue.songs
            .slice(0, 10)
            .map((s, i) => `${i === 0 ? '▶️' : `${i}.`} **[${s.name}](${s.url})** (\`${s.formattedDuration}\`)`)
            .join('\n');

          const embed = CustomEmbed.info(
            `Hàng đợi (${queue.songs.length} bài hát)`,
            list + (queue.songs.length > 10 ? `\n\n*...và ${queue.songs.length - 10} bài hát khác*` : '')
          );
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        default:
          return interaction.reply({ content: 'Nút không xác định!', ephemeral: true });
      }
    } catch (err) {
      return interaction.reply({
        embeds: [CustomEmbed.error('Lỗi Thao Tác', err.message || 'Không thể thực hiện hành động này!')],
        ephemeral: true
      });
    }
  }
};
