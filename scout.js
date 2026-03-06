require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// These are the things Norman is listening for
const keywords = ['lightstream', 'obs', 'streamlabs', 'help', 'error', 'fix'];

client.once('ready', () => {
  console.log(`✅ Norman is awake and scouting as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  // 1. Don't let Norman talk to himself or other bots
  if (message.author.bot) return;

  // 2. Check if the message has your keywords
  const content = message.content.toLowerCase();
  const foundKeyword = keywords.find(word => content.includes(word));

  if (foundKeyword) {
    console.log(`Lead found in ${message.guild.name}! Sending to Jeremy...`);

    // 3. Send the DM to you
    try {
      const me = await client.users.fetch(process.env.MY_USER_ID);
      await me.send(`
🕵️ **Norman Scout Report**
**Keyword:** ${foundKeyword}
**Server:** ${message.guild.name} (#${message.channel.name})
**User:** ${message.author.username}
**Message:** "${message.content}"
**Jump to Post:** ${message.url}
      `);
    } catch (err) {
      console.error("Failed to send DM:", err);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
