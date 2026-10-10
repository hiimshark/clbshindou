const CustomEmbed = require('../../utils/embedBuilder');
const EMOJIS = require('../../utils/emojis');
const logger = require('../../utils/logger');

// Lưu trữ bộ hẹn giờ đếm ngược 1 phút cho các máy chủ
const emptyTimeouts = new Map();

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    const guild = newState.guild || oldState.guild;
    if (!guild) return;

    const botMember = guild.members.me;
    if (!botMember) return;

    const botVoiceChannel = botMember.voice.channel;

    // Nếu bot không còn ở trong bất kỳ phòng thoại nào
    if (!botVoiceChannel) {
      if (emptyTimeouts.has(guild.id)) {
        clearTimeout(emptyTimeouts.get(guild.id));
        emptyTimeouts.delete(guild.id);
      }
      return;
    }

    // Đếm số lượng thành viên người thật (không tính bot) trong phòng
    const humanMembers = botVoiceChannel.members.filter(m => !m.user.bot);

    // TRƯỜNG HỢP 1: Phòng thoại KHÔNG CÒN AI (hoặc chỉ có bot)
    if (humanMembers.size === 0) {
      if (!emptyTimeouts.has(guild.id)) {
        logger.music(`Phòng thoại ${botVoiceChannel.name} tại ${guild.name} không còn ai. Bắt đầu đếm ngược 1 phút tự động rời...`);

        const timeout = setTimeout(async () => {
          emptyTimeouts.delete(guild.id);

          const currentBotVoice = guild.members.me?.voice.channel;
          if (!currentBotVoice) return;

          const currentHumans = currentBotVoice.members.filter(m => !m.user.bot);
          if (currentHumans.size === 0) {
            const queue = client.distube?.getQueue(guild.id);
            if (queue) {
              queue.textChannel?.send({
                embeds: [CustomEmbed.warning(
                  'Tự Động Rời Phòng Thoại',
                  `${EMOJIS.sparkle} Phòng thoại không có người nghe trong **1 phút**, bot đã tự động rời phòng để tối ưu tài nguyên!`
                )]
              }).catch(() => {});
              queue.stop();
            } else {
              client.distube?.voices?.leave(guild.id);
            }

            logger.music(`Đã tự động rời phòng thoại ${currentBotVoice.name} tại ${guild.name} sau 1 phút phòng trống.`);
          }
        }, 60 * 1000); // 60 giây = 1 phút

        emptyTimeouts.set(guild.id, timeout);
      }
    } else {
      // TRƯỜNG HỢP 2: Có người dùng người thật tham gia vào phòng
      if (emptyTimeouts.has(guild.id)) {
        clearTimeout(emptyTimeouts.get(guild.id));
        emptyTimeouts.delete(guild.id);
        logger.music(`Có người tham gia phòng thoại ${botVoiceChannel.name} tại ${guild.name}. Đã hủy đếm ngược rời phòng!`);
      }
    }
  }
};
