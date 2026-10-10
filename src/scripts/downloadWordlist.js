const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://raw.githubusercontent.com/duyet/vietnamese-wordlist/master/Viet74K.txt';
console.log('Downloading Vietnamese wordlist from GitHub...');

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download: status code ${res.statusCode}`);
    process.exit(1);
  }

  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const lines = data.split(/\r?\n/);
    const twoWordSet = new Set();
    const specialChars = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;

    for (const rawLine of lines) {
      const clean = rawLine.trim().toLowerCase();
      const parts = clean.split(/\s+/);
      if (parts.length === 2 && parts[0] && parts[1] && !specialChars.test(clean)) {
        twoWordSet.add(clean);
      }
    }

    const arr = Array.from(twoWordSet).sort();
    const outputPath = path.join(__dirname, '..', 'data', 'vietnamese_words.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(arr, null, 2), 'utf-8');
    console.log(`[Wordlist] Hoàn tất! Đã lưu ${arr.length} cụm từ 2 tiếng vào ${outputPath}`);
  });
}).on('error', (err) => {
  console.error('[Wordlist] Download error:', err.message);
  process.exit(1);
});
