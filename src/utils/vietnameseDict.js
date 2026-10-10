const path = require('path');
const fs = require('fs');
const logger = require('./logger');

let wordSet = null;

function loadDictionary() {
  if (wordSet) return wordSet;
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'vietnamese_words.json');
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf-8');
      const list = JSON.parse(raw);
      wordSet = new Set(list.map(w => w.trim().toLowerCase()));
      
      // Bổ sung các cụm danh từ ghép với loại từ phổ biến (con, cái, quả, trái, cây, củ, v.v.)
      const classifiers = [
        'con', 'cái', 'quả', 'trái', 'cây', 'bông', 'lá', 'củ', 'hạt', 'viên', 'bức', 'tấm', 'quyển', 'cuốn', 'ngôi', 'tòa', 'chiếc', 'bầy', 'đàn'
      ];
      const commonNouns = [
        'mèo', 'chó', 'gà', 'vịt', 'ngỗng', 'heo', 'lợn', 'bò', 'trâu', 'ngựa', 'dê', 'cừu', 'cá', 'tôm', 'cua', 'mực',
        'chim', 'ong', 'bướm', 'voi', 'hổ', 'cọp', 'báo', 'khỉ', 'vượn', 'chuột', 'rắn', 'rùa', 'ếch', 'nhái', 'cóc',
        'thỏ', 'nai', 'hươu', 'sóc', 'nhím', 'gấu', 'sói', 'cáo', 'lừa', 'lạc đà', 'cá voi', 'cá mập', 'sư tử',
        'bàn', 'ghế', 'nhà', 'cửa', 'bút', 'viết', 'sách', 'vở', 'gối', 'giường', 'chén', 'bát', 'đĩa', 'đũa', 'thìa',
        'dao', 'kéo', 'nồi', 'chảo', 'xe', 'áo', 'quần', 'mũ', 'nón', 'giày', 'dép', 'túi', 'ví', 'đồng hồ', 'máy',
        'táo', 'cam', 'quýt', 'chanh', 'bưởi', 'chuối', 'nho', 'dưa', 'dừa', 'xoài', 'mận', 'đào', 'ổi', 'mít', 'lê',
        'tre', 'trúc', 'mai', 'cau', 'bàng', 'phượng', 'thông', 'tùng', 'cúc', 'lan', 'sen', 'sung', 'vú sữa', 'măng',
        'cà rốt', 'khoai', 'sắn', 'hành', 'tỏi', 'gừng', 'nghệ', 'ớt', 'su hào', 'cải', 'xà lách', 'rau', 'cỏ'
      ];

      for (const cl of classifiers) {
        for (const noun of commonNouns) {
          wordSet.add(`${cl} ${noun}`.trim().toLowerCase());
        }
      }

      logger.info(`Đã nạp ${wordSet.size} từ điển tiếng Việt (kèm từ ghép mở rộng) vào bộ nhớ.`);
    } else {
      logger.warn(`Không tìm thấy file ${dataPath}. Minigame nối từ sẽ dùng chế độ nới lỏng.`);
      wordSet = new Set();
    }
  } catch (err) {
    logger.error('Lỗi khi nạp từ điển tiếng Việt:', err.message);
    wordSet = new Set();
  }
  return wordSet;
}

const vietnameseDict = {
  init: () => loadDictionary(),

  normalize: (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
  },

  getWordCount: (text) => {
    const clean = vietnameseDict.normalize(text);
    if (!clean) return 0;
    return clean.split(' ').length;
  },

  isValidTwoWords: (text) => {
    const clean = vietnameseDict.normalize(text);
    const parts = clean.split(' ');
    if (parts.length !== 2) return false;

    // Check special characters or numbers
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(clean)) {
      return false;
    }

    const dict = loadDictionary();
    if (dict.size === 0) return true; // Fallback if dictionary file wasn't loaded
    return dict.has(clean);
  },

  canChain: (prevPhrase, nextPhrase) => {
    const prevClean = vietnameseDict.normalize(prevPhrase);
    const nextClean = vietnameseDict.normalize(nextPhrase);

    const prevParts = prevClean.split(' ');
    const nextParts = nextClean.split(' ');

    if (prevParts.length !== 2 || nextParts.length !== 2) return false;
    // Word chaining rule: the last syllable of prevPhrase must match the first syllable of nextPhrase
    return prevParts[1] === nextParts[0];
  }
};

module.exports = vietnameseDict;
