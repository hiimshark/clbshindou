const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbed = require('../../utils/embedBuilder');
const { PALETTE, DIVIDER } = require('../../utils/embedBuilder');
const EMOJIS = require('../../utils/emojis');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Xem toàn bộ danh sách tính năng và bảng lệnh của Bot'),

  async execute(interaction, client) {
    const embed = CustomEmbed.card(PALETTE.amethyst)
      .setAuthor({
        name: `TRUNG TÂM TRỢ GIÚP & HƯỚNG DẪN • SHINDOU`,
        iconURL: client.user.displayAvatarURL()
      })
      .setTitle(`${EMOJIS.party} Bảng Lệnh & Tính Năng Hệ Thống ${EMOJIS.crownPink}`)
      .setDescription(
        `${DIVIDER}\n` +
        `Chào mừng bạn đến với **${client.user.username}**! Dưới đây là toàn bộ danh mục lệnh Slash (/):\n\n` +
        `🎵 **ÂM NHẠC & GIẢI TRÍ**\n` +
        `• \`/play <tên/link>\`: Phát nhạc từ YouTube, Spotify, SoundCloud.\n` +
        `• \`/pause\` | \`/resume\`: Tạm dừng hoặc tiếp tục bài hát.\n` +
        `• \`/skip\` | \`/stop\`: Chuyển tiếp bài hoặc dừng phát và rời phòng.\n` +
        `• \`/nowplaying\` | \`/queue\`: Xem bài đang phát (kèm nút bấm) & hàng đợi.\n` +
        `• \`/volume <1-100>\`: Tùy chỉnh âm lượng âm thanh.\n\n` +
        `🎮 **MINIGAME NỐI TỪ TIẾNG VIỆT**\n` +
        `• \`/noitu set #kênh\`: Đặt kênh thi đấu nối từ tự động 24/7.\n` +
        `• \`/noitu stats\`: Xem kỷ lục chuỗi streak dài nhất của server.\n` +
        `• \`/noitu reset\`: Khởi tạo lại chuỗi nối từ về 0.\n\n` +
        `🎫 **HỆ THỐNG CSKH & TICKET**\n` +
        `• \`/ticket setup\`: Tạo bảng điều khiển mở ticket hỗ trợ riêng tư.\n` +
        `• \`/ticket close\`: Đóng ticket, khóa kênh và xuất transcript.\n\n` +
        `🛡️ **QUẢN TRỊ & KIỂM DUYỆT (STAFF)**\n` +
        `• \`/mute <user> <thời gian> [lý do]\`: Cấm chat thành viên vi phạm.\n` +
        `• \`/unmute <user>\`: Gỡ cấm chat cho thành viên.\n` +
        `• \`/kick <user> [lý do]\`: Trục xuất thành viên khỏi máy chủ.\n` +
        `• \`/ban <user> [lý do]\`: Cấm vĩnh viễn thành viên khỏi máy chủ.\n` +
        `• \`/clear <số lượng> [user]\`: Dọn dẹp nhanh hàng loạt tin nhắn.\n\n` +
        `⚙️ **CẤU HÌNH MÁY CHỦ**\n` +
        `• \`/setwelcome #kênh [lời chào]\`: Kênh & thiệp chào mừng thành viên mới.\n` +
        `• \`/setgoodbye #kênh [lời chào]\`: Kênh thông báo thành viên rời đi.\n` +
        `• \`/autorole set @role\` | \`/autorole status\`: Tự động cấp role tân thủ.\n` +
        `• \`/announce #kênh <tiêu đề> <nội dung>\`: Gửi thông báo Embed sang trọng.\n\n` +
        `🔍 **TIỆN ÍCH & THÔNG TIN**\n` +
        `• \`/userinfo [user]\`: Xem chi tiết hồ sơ tài khoản và vai trò.\n` +
        `• \`/avatar [user]\`: Tải ảnh đại diện tài khoản & máy chủ full HD.\n` +
        `• \`/ping\`: Kiểm tra độ trễ WebSocket và RAM của bot trên Railway.\n` +
        `• \`/emojis\`: Quét và lấy mã toàn bộ Emoji động/tĩnh của máy chủ.\n` +
        `${DIVIDER}`
      )
      .setFooter({
        text: `SHINDOU ENGINE 24/7 • Hoạt động ổn định trên Railway Cloud`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      });

    return interaction.reply({ embeds: [embed] });
  }
};
