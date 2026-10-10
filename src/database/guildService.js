const { getDatabase } = require('./db');

const guildService = {
  // --- GUILD CONFIG ---
  getConfig: (guildId) => {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM guild_configs WHERE guild_id = ?').get(guildId);
    if (!row) {
      db.prepare('INSERT INTO guild_configs (guild_id) VALUES (?)').run(guildId);
      return db.prepare('SELECT * FROM guild_configs WHERE guild_id = ?').get(guildId);
    }
    return row;
  },

  updateConfig: (guildId, updates) => {
    const db = getDatabase();
    guildService.getConfig(guildId); // ensure row exists

    const fields = Object.keys(updates);
    if (fields.length === 0) return;

    const setClauses = fields.map(f => `${f} = ?`).join(', ');
    const values = [...Object.values(updates), guildId];

    db.prepare(`UPDATE guild_configs SET ${setClauses}, updated_at = strftime('%s', 'now') WHERE guild_id = ?`).run(...values);
  },

  // --- WELCOME & GOODBYE ---
  setWelcome: (guildId, channelId, message = null) => {
    guildService.updateConfig(guildId, {
      welcome_channel_id: channelId,
      ...(message ? { welcome_message: message } : {})
    });
  },

  setGoodbye: (guildId, channelId, message = null) => {
    guildService.updateConfig(guildId, {
      goodbye_channel_id: channelId,
      ...(message ? { goodbye_message: message } : {})
    });
  },

  // --- AUTOROLE ---
  setAutoRole: (guildId, roleId) => {
    guildService.updateConfig(guildId, {
      autorole_id: roleId
    });
  },

  // --- TICKET SYSTEM ---
  setTicketConfig: (guildId, { categoryId, logChannelId, staffRoleId }) => {
    const updates = {};
    if (categoryId !== undefined) updates.ticket_category_id = categoryId;
    if (logChannelId !== undefined) updates.ticket_log_channel_id = logChannelId;
    if (staffRoleId !== undefined) updates.ticket_staff_role_id = staffRoleId;
    guildService.updateConfig(guildId, updates);
  },

  createTicket: (channelId, guildId, userId, reason = '') => {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO tickets (channel_id, guild_id, user_id, status, reason, created_at)
      VALUES (?, ?, ?, 'open', ?, strftime('%s', 'now'))
    `).run(channelId, guildId, userId, reason);
  },

  getTicket: (channelId) => {
    const db = getDatabase();
    return db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(channelId);
  },

  closeTicket: (channelId) => {
    const db = getDatabase();
    db.prepare(`UPDATE tickets SET status = 'closed', closed_at = strftime('%s', 'now') WHERE channel_id = ?`).run(channelId);
  },

  // --- MINIGAME NỐI TỪ ---
  setWordChainChannel: (guildId, channelId) => {
    guildService.updateConfig(guildId, {
      noitu_channel_id: channelId,
      noitu_streak: 0,
      noitu_last_word: null,
      noitu_last_user_id: null,
      noitu_used_words: '[]'
    });
  },

  getWordChainData: (guildId) => {
    const config = guildService.getConfig(guildId);
    let usedWords = [];
    try {
      usedWords = JSON.parse(config.noitu_used_words || '[]');
    } catch {
      usedWords = [];
    }
    return {
      channelId: config.noitu_channel_id,
      streak: config.noitu_streak || 0,
      maxStreak: config.noitu_max_streak || 0,
      lastWord: config.noitu_last_word,
      lastUserId: config.noitu_last_user_id,
      usedWords
    };
  },

  updateWordChainSuccess: (guildId, word, userId, newStreak, usedWords) => {
    const db = getDatabase();
    const config = guildService.getConfig(guildId);
    const maxStreak = Math.max(config.noitu_max_streak || 0, newStreak);
    
    db.prepare(`
      UPDATE guild_configs 
      SET noitu_streak = ?,
          noitu_max_streak = ?,
          noitu_last_word = ?,
          noitu_last_user_id = ?,
          noitu_used_words = ?,
          updated_at = strftime('%s', 'now')
      WHERE guild_id = ?
    `).run(newStreak, maxStreak, word, userId, JSON.stringify(usedWords), guildId);
  },

  resetWordChainStreak: (guildId) => {
    const db = getDatabase();
    db.prepare(`
      UPDATE guild_configs
      SET noitu_streak = 0,
          noitu_last_word = null,
          noitu_last_user_id = null,
          noitu_used_words = '[]',
          updated_at = strftime('%s', 'now')
      WHERE guild_id = ?
    `).run(guildId);
  }
};

module.exports = guildService;
