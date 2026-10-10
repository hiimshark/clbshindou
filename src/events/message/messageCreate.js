const guildService = require('../../database/guildService');
const vietnameseDict = require('../../utils/vietnameseDict');
const logger = require('../../utils/logger');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const gameData = guildService.getWordChainData(message.guild.id);
    if (!gameData.channelId || message.channel.id !== gameData.channelId) {
      return;
    }

    const rawContent = message.content;
    const cleanWord = vietnameseDict.normalize(rawContent);

    // Bỏ qua tin nhắn bắt đầu bằng dấu gạch chéo (nếu có bot prefix khác)
    if (rawContent.startsWith('/') || rawContent.startsWith('!')) return;

    // 1. Kiểm tra định dạng 2 từ (âm tiết)
    const wordCount = vietnameseDict.getWordCount(cleanWord);
    if (wordCount !== 2) {
      await message.react('❌').catch(() => {});
      return message.reply({
        content: `⚠️ Cụm từ bạn nhập phải có **đúng 2 tiếng** (Ví dụ: \`con mèo\`, \`mèo mướp\`).`
      });
    }

    // 2. Chống tự nối 2 lượt liên tiếp
    if (gameData.lastUserId === message.author.id) {
      await message.react('❌').catch(() => {});
      return message.reply({
        content: `⚠️ Bạn không thể tự nối lượt của chính mình! Hãy nhường cho người chơi khác.`
      });
    }

    // 3. Kiểm tra từ điển Tiếng Việt
    if (!vietnameseDict.isValidTwoWords(cleanWord)) {
      await message.react('❌').catch(() => {});
      guildService.resetWordChainStreak(message.guild.id);
      return message.reply({
        content: `❌ Cụm từ **"${cleanWord}"** không có trong từ điển tiếng Việt!\n` +
                 `💥 Chuỗi điểm **${gameData.streak}** đã bị reset về 0. Hãy bắt đầu một chuỗi mới bất kỳ!`
      });
    }

    // 4. Kiểm tra luật nối từ (tiếng đầu người sau trùng tiếng cuối người trước)
    if (gameData.lastWord) {
      if (!vietnameseDict.canChain(gameData.lastWord, cleanWord)) {
        await message.react('❌').catch(() => {});
        guildService.resetWordChainStreak(message.guild.id);
        const expectedStart = gameData.lastWord.split(' ')[1];
        return message.reply({
          content: `❌ Cụm từ **"${cleanWord}"** không bắt đầu bằng chữ **"${expectedStart}"** (từ trước: *${gameData.lastWord}*)!\n` +
                   `💥 Chuỗi điểm **${gameData.streak}** đã bị reset về 0. Bắt đầu lại nào!`
        });
      }
    }

    // 5. Kiểm tra lặp từ trong chuỗi hiện tại
    if (gameData.usedWords.includes(cleanWord)) {
      await message.react('❌').catch(() => {});
      guildService.resetWordChainStreak(message.guild.id);
      return message.reply({
        content: `❌ Cụm từ **"${cleanWord}"** đã từng xuất hiện trong chuỗi này!\n` +
                 `💥 Chuỗi điểm **${gameData.streak}** đã bị reset về 0. Bắt đầu lại nào!`
      });
    }

    // 6. NỐI TỪ HỢP LỆ THÀNH CÔNG!
    await message.react('✅').catch(() => {});
    const newStreak = gameData.streak + 1;
    const newUsedWords = [...gameData.usedWords, cleanWord];

    guildService.updateWordChainSuccess(
      message.guild.id,
      cleanWord,
      message.author.id,
      newStreak,
      newUsedWords
    );

    logger.game(`Nối từ thành công tại guild ${message.guild.name}: "${cleanWord}" bởi ${message.author.tag} (Streak: ${newStreak})`);

    // Thông báo mốc streak đặc biệt hoặc kỷ lục mới
    if (newStreak % 25 === 0) {
      await message.channel.send({
        content: `🔥 **Tuyệt vời!** Chuỗi nối từ máy chủ đã đạt mốc **${newStreak}** từ liên tiếp!`
      });
    } else if (newStreak > gameData.maxStreak && newStreak > 10 && (newStreak - gameData.maxStreak === 1)) {
      await message.channel.send({
        content: `🏆 **Kỷ lục mới!** Máy chủ vừa thiết lập chuỗi nối từ dài nhất: **${newStreak}** từ!`
      });
    }
  }
};
