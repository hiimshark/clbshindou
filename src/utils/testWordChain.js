const vietnameseDict = require('./vietnameseDict');

console.log('--- TEST MINIGAME NỐI TỪ TIẾNG VIỆT ---');
vietnameseDict.init();

const testCases = [
  { word: 'con mèo', expectedValid: true },
  { word: 'mèo mướp', expectedValid: true },
  { word: 'mướp đắng', expectedValid: true },
  { word: 'asdfghj', expectedValid: false },
  { word: 'con', expectedValid: false },
  { word: 'con mèo con', expectedValid: false },
];

console.log('\n1. Kiểm tra tính hợp lệ từ vựng:');
let passed = 0;
for (const tc of testCases) {
  const actual = vietnameseDict.isValidTwoWords(tc.word);
  const ok = actual === tc.expectedValid;
  if (ok) passed++;
  console.log(`- "${tc.word}": ${actual ? 'HỢP LỆ' : 'KHÔNG HỢP LỆ'} (Kỳ vọng: ${tc.expectedValid ? 'HỢP LỆ' : 'KHÔNG HỢP LỆ'}) -> ${ok ? 'PASS ✅' : 'FAIL ❌'}`);
}

console.log('\n2. Kiểm tra chuỗi nối từ:');
const chainTests = [
  { prev: 'con mèo', next: 'mèo mướp', expected: true },
  { prev: 'mèo mướp', next: 'mướp đắng', expected: true },
  { prev: 'mướp đắng', next: 'con chuột', expected: false },
];

for (const ct of chainTests) {
  const actual = vietnameseDict.canChain(ct.prev, ct.next);
  const ok = actual === ct.expected;
  if (ok) passed++;
  console.log(`- "${ct.prev}" -> "${ct.next}": ${actual ? 'NỐI ĐƯỢC' : 'KHÔNG NỐI ĐƯỢC'} -> ${ok ? 'PASS ✅' : 'FAIL ❌'}`);
}

console.log(`\nKết quả: ${passed}/${testCases.length + chainTests.length} tests passed.`);
if (passed === testCases.length + chainTests.length) {
  console.log('Tất cả test nối từ ĐÃ VƯỢT QUA HOÀN HẢO! 🎉');
  process.exit(0);
} else {
  process.exit(1);
}
