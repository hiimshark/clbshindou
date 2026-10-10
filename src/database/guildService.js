const { getDatabase, isJsonFallback, getJsonStore, saveJsonStore } = require('./db');

const guildService = {
  // --- GUILD CONFIG ---
  getConfig: (guildId) => {
    if (isJsonFallback()) {
      const store = getJsonStore();
      if (!store.guild_configs[guildId]) {
        store.guild_configs[guildId] = {
          guild_id: guildId,
          welcome_channel_id: null,
          welcome_message: null,
          goodbye_channel_id: null,
          goodbye_message: null,
          autorole_id: null,
          ticket_category_id: null,
          ticket_log_channel_id: null,
          ticket_staff_role_id: null,
          noitu_channel_id: null,
          noitu_streak: 0,
          noitu_max_streak: 0,
          noitu_last_word: null,
          noitu_last_user_id: null,
          noitu_used_words: '[]'
        };
        saveJsonStore();
      }
      return store.guild_configs[guildId];
    }

    const db = getDatabase();
    const row = db.prepare('SELECT * FROM guild_configs WHERE guild_id = ?').get(guildId);
    if (!row) {
      db.prepare('INSERT INTO guild_configs (guild_id) VALUES (?)').run(guildId);
      return db.prepare('SELECT * FROM guild_configs WHERE guild_id = ?').get(guildId);
    }
    return row;
  },

  updateConfig: (guildId, updates) => {
    if (isJsonFallback()) {
      const current = guildService.getConfig(guildId);
      Object.assign(current, updates);
      saveJsonStore();
      return;
    }

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
    if (isJsonFallback()) {
      const store = getJsonStore();
      store.tickets[channelId] = {
        channel_id: channelId,
        guild_id: guildId,
        user_id: userId,
        status: 'open',
        reason,
        created_at: Math.floor(Date.now() / 1000)
      };
      saveJsonStore();
      return;
    }

    const db = getDatabase();
    db.prepare(`
      INSERT INTO tickets (channel_id, guild_id, user_id, status, reason, created_at)
      VALUES (?, ?, ?, 'open', ?, strftime('%s', 'now'))
    `).run(channelId, guildId, userId, reason);
  },

  getTicket: (channelId) => {
    if (isJsonFallback()) {
      return getJsonStore().tickets[channelId] || null;
    }
    const db = getDatabase();
    return db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(channelId);
  },

  closeTicket: (channelId) => {
    if (isJsonFallback()) {
      const ticket = getJsonStore().tickets[channelId];
      if (ticket) {
        ticket.status = 'closed';
        ticket.closed_at = Math.floor(Date.now() / 1000);
        saveJsonStore();
      }
      return;
    }
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
    const cfg = guildService.getConfig(guildId);
    let usedWords = [];
    try {
      usedWords = JSON.parse(cfg.noitu_used_words || '[]');
    } catch {
      usedWords = [];
    }
    return {
      channelId: cfg.noitu_channel_id,
      streak: cfg.noitu_streak || 0,
      maxStreak: cfg.noitu_max_streak || 0,
      lastWord: cfg.noitu_last_word,
      lastUserId: cfg.noitu_last_user_id,
      usedWords
    };
  },

  updateWordChainSuccess: (guildId, word, userId, newStreak, usedWords) => {
    const cfg = guildService.getConfig(guildId);
    const maxStreak = Math.max(cfg.noitu_max_streak || 0, newStreak);

    if (isJsonFallback()) {
      guildService.updateConfig(guildId, {
        noitu_streak: newStreak,
        noitu_max_streak: maxStreak,
        noitu_last_word: word,
        noitu_last_user_id: userId,
        noitu_used_words: JSON.stringify(usedWords)
      });
      return;
    }

    const db = getDatabase();
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
    if (isJsonFallback()) {
      guildService.updateConfig(guildId, {
        noitu_streak: 0,
        noitu_last_word: null,
        noitu_last_user_id: null,
        noitu_used_words: '[]'
      });
      return;
    }
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
