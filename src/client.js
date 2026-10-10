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

  return client;
}

module.exports = { createDiscordClient };
