const { PlayableExtractorPlugin, Song, Playlist } = require('distube');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

const isWin = process.platform === 'win32';

function resolveYtPath() {
  const linuxGlobal = '/usr/local/bin/yt-dlp';
  if (fs.existsSync(linuxGlobal)) return linuxGlobal;

  const nodeModulesBin = path.join(__dirname, '../../node_modules/@distube/yt-dlp/bin', isWin ? 'yt-dlp.exe' : 'yt-dlp');
  if (fs.existsSync(nodeModulesBin)) return nodeModulesBin;

  return 'yt-dlp';
}

const ytPath = resolveYtPath();

function getYtDlpJson(url, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const cp = spawn(ytPath, [
      url,
      '--dump-single-json',
      '--no-warnings',
      '--prefer-free-formats',
      '--skip-download',
      '--simulate',
      ...extraArgs
    ]);

    let stdout = '';
    let stderr = '';

    cp.stdout.on('data', chunk => {
      stdout += chunk;
    });

    cp.stderr.on('data', chunk => {
      stderr += chunk;
    });

    cp.on('close', code => {
      if (code === 0) {
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          reject(new Error(`Không thể phân tích dữ liệu YouTube: ${e.message}`));
        }
      } else {
        reject(new Error(stderr.trim() || `yt-dlp kết thúc với mã lỗi ${code}`));
      }
    });

    cp.on('error', reject);
  });
}

// Tìm kiếm YouTube siêu tốc qua HTML (< 1s), chính xác 100% video gốc
async function searchYouTube(query) {
  try {
    const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const html = await res.text();
      const match = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
      if (match) {
        return `https://www.youtube.com/watch?v=${match[1]}`;
      }
    }
  } catch (err) {
    logger.warn('Lỗi tìm kiếm YouTube siêu tốc:', err.message);
  }
  return null;
}

class CustomYtDlpPlugin extends PlayableExtractorPlugin {
  validate(url) {
    if (typeof url !== 'string') return false;
    return /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\//i.test(url) || url.startsWith('ytsearch:');
  }

  async resolve(url, options = {}) {
    const info = await getYtDlpJson(url, ['-f', 'ba/ba*']);

    // Xử lý Playlist
    if (Array.isArray(info.entries)) {
      if (!info.entries.length) throw new Error('Playlist YouTube này đang trống!');
      return new Playlist({
        source: 'youtube',
        songs: info.entries.map(i => new Song({
          plugin: this,
          source: 'youtube',
          playFromSource: true,
          id: i.id,
          name: i.title || i.fulltitle,
          url: i.webpage_url || i.original_url || `https://www.youtube.com/watch?v=${i.id}`,
          thumbnail: i.thumbnail || i.thumbnails?.[0]?.url,
          duration: i.duration || 0,
          uploader: { name: i.uploader, url: i.uploader_url }
        }, options)),
        id: info.id ? info.id.toString() : 'yt-playlist',
        name: info.title || 'YouTube Playlist',
        url: info.webpage_url || url,
        thumbnail: info.thumbnails?.[0]?.url
      }, options);
    }

    // Xử lý bài hát đơn (Single track)
    const song = new Song({
      plugin: this,
      source: 'youtube',
      playFromSource: true,
      id: info.id,
      name: info.title || info.fulltitle,
      url: info.webpage_url || info.original_url || url,
      isLive: Boolean(info.is_live),
      thumbnail: info.thumbnail || info.thumbnails?.[0]?.url,
      duration: info.is_live ? 0 : (info.duration || 0),
      uploader: { name: info.uploader, url: info.uploader_url },
      views: info.view_count
    }, options);

    // Lưu stream URL âm thanh trực tiếp để phát ngay lập tức, không tốn thêm lượt gọi
    if (info.url) {
      song.stream.url = info.url;
    }

    return song;
  }

  async getStreamURL(song) {
    if (song.stream?.url) return song.stream.url;
    const info = await getYtDlpJson(song.url, ['-f', 'ba/ba*']);
    return info.url;
  }

  async searchSong(query, options = {}) {
    let url = await searchYouTube(query);
    if (!url) {
      url = `ytsearch1:${query}`;
    }
    return this.resolve(url, options);
  }

  getRelatedSongs() {
    return [];
  }
}

module.exports = {
  CustomYtDlpPlugin,
  searchYouTube,
  getYtDlpJson
};
