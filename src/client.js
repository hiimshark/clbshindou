const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');

function createDiscordClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,        // Welcome, Goodbye, AutoRole
      GatewayIntentBits.GuildMessages,       // Nối từ, Clear
      GatewayIntentBits.MessageContent,      // Đọc nội dung nối từ
      GatewayIntentBits.GuildVoiceStates,    // Phát nhạc
      GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
      Partials.Channel,
      Partials.Message,
      Partials.User,
      Partials.GuildMember,
      Partials.Reaction
    ]
  });

  // Collections for commands and component handlers
  client.commands = new Collection();
  client.buttons = new Collection();
  client.modals = new Collection();

  // Bắt toàn bộ lỗi Gateway để không bao giờ bị crash
  client.on('error', err => {
    console.error('[Discord Client Error]:', err);
  });
  client.on('shardError', (err, shardId) => {
    console.error(`[Discord Shard ${shardId} Error]:`, err);
  });
  client.on('warn', info => {
    console.warn('[Discord Client Warning]:', info);
  });

  return client;
}

module.exports = { createDiscordClient };
