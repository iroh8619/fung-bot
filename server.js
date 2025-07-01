const { Client, Intents, MessageEmbed, MessageAttachment } = require('discord.js');
require('dotenv').config();

const express = require('express');
const app = express();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.MESSAGE_CONTENT,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

// Express to keep the bot alive
app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

// Start server on port 3000 or the port Glitch sets
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

module.exports = app;

// IDs for configuration
const WATCH_CHANNEL_ID = '1081912541808181308'; // Replace with the ID of the channel to watch
const WELCOME_CHANNEL_ID = '1315733983090180167'; // Replace with the ID of the welcome channel
const RULES_CHANNEL_ID = '905876133151637578'; // Replace with the ID of the channel for the rules
const REACTION_EMOJI = '<:White_Lotus_Tile:1361346119984222328>'; // Flower emoji

// Message patterns
const TRIGGER_PHRASE = /one who has eaten the fruit,? and tasted its mysteries\.?/i;
const WELCOME_MESSAGE = 'Welcome, brother. The white opens wide.';

// DM secret message
const SECRET_QUESTION = 'Who knocks at the garden gate?';

// Event: Bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  // Set the bot's status to "Watching Pai Sho"
 const activities = [
    { name: 'Pai Sho', type: 0 }, // Playing
    { name: 'the White Lotus', type: 3 },     // Watching
  ];

  let currentIndex = 0;

  // Function to update activity
  function updateActivity() {
    const activity = activities[currentIndex];
    client.user.setActivity(activity.name, { type: activity.type });

    // Move to the next activity
    currentIndex = (currentIndex + 1) % activities.length;
  }

  // Set initial activity and then alternate every 10 seconds
  updateActivity();
  setInterval(updateActivity, 10000);});

const imagePath = 'https://i.imghippo.com/files/GjAC1019aGc.png';
const imageAttachment = new MessageAttachment(imagePath); // For older Discord.js

// Command to send rules
client.on('messageCreate', async (message) => {
  if (message.content === '!sendRules' && message.member.permissions.has('ADMINISTRATOR')) {
    const embed = new MessageEmbed()
      .setColor('#FFCC00')
      .setTitle('📜 | UNCLE IROH SERVER RULES')
      .setDescription('**Welcome, friends! This place stays strong through balance and respect. Follow these simple rules to help keep it calm and kind for everyone.**')
      .addFields(
        {
          name: '<:water:963785977321619456> | COMMUNITY RULES',
          value: `1. Respect Discord's Terms and Guidelines.\n2. Treat everyone with kindness, no matter who they are.\n3. Speak with care, and avoid hurtful words.\n4. Harassment or threats are not welcome here.\n5. Use names and pictures that are thoughtful and respectful.\n6. Trust the <@&964186116594991144> to keep things fair and balanced.`,
        },
        { name: '<:earth:963786392662593676> | CHANNEL RULES', value: `1. Speak in English so we can all understand each other.\n2. Avoid topics like politics or religion that divide us.\n3. Use each channel for its purpose.\n4. Don’t spam or overwhelm the chat.\n5. Tag others only when it truly matters.\n6. Keep personal details private and safe.\n7. Mark spoilers clearly to avoid spoiling others’ joy.` },
        { name: '<:fire:963786148474392676> | VOICE RULES', value: '1. Respect others’ comfort and leave if asked.' },
        { name: '<:air:963786497113358406> | CONTENT RULES', value: `1. Keep content appropriate for all.\n2. Do not advertise or promote without permission.\n3. Share only safe and honest links.` },
        { name: '<:iroh_smiling:1014261320578772993> | AGREEMENT', value: 'Your joining shows you accept these simple guidelines to keep our shared space warm and welcoming for everyone. Let us build a truly good community here together!' }
      )
      .setFooter({
        text: `Posted on ${new Date().toLocaleDateString()}`,
        iconURL: 'https://i.imghippo.com/files/UYwL4302LKE.png', // Sender's profile picture
      });

    // Send the embed in the specified rules channel
    const rulesChannel = client.channels.cache.get(RULES_CHANNEL_ID);
    if (rulesChannel) {
      const imagePath = 'https://i.imghippo.com/files/GjAC1019aGc.png';

     // Replace with the local file path
      const imageAttachment = new MessageAttachment(imagePath); // For older Discord.js versions
      
      await rulesChannel.send({
        files: [imageAttachment], // Attach the image
        embeds: [embed], // Send the embed
      });
      message.reply('Rules have been posted successfully with reactions!');
    } else {
      message.reply('Could not find the rules channel!');
    }
  }
});

// Event: Message created
client.on('messageCreate', async (message) => {
  if (message.channel.id === WATCH_CHANNEL_ID && TRIGGER_PHRASE.test(message.content)) {
    try {
      // React to the message with a flower emoji
      await message.react(REACTION_EMOJI);

      // Send a welcome message to the designated welcome channel
      const welcomeChannel = message.guild.channels.cache.get(WELCOME_CHANNEL_ID);
      if (welcomeChannel) {
        await welcomeChannel.send(
          `Welcome <@${message.author.id}>, the White Lotus opens wide to those who know her secrets. <:White_Lotus_Tile:1361346119984222328>`
        );
      } else {
        console.error('Welcome channel not found!');
      }

      // Remove the Stranger role
      const member = message.guild.members.cache.get(message.author.id);
      if (member) {
        const strangerRole = message.guild.roles.cache.get('964532381493125130'); // Replace with Stranger role ID
        if (strangerRole) {
          await member.roles.remove(strangerRole);
          console.log(`Removed Stranger role from ${message.author.tag}`);
        } else {
          console.error('Stranger role not found!');
        }
      } else {
        console.error('Member not found in guild!');
      }
    } catch (error) {
      console.error('Error handling messageCreate:', error);
    }
  }
});

// Event: New member joins
client.on('guildMemberAdd', async (member) => {
  try {
    await member.send(`The key to enter the Garden Gate is: "One who has eaten the fruit and tasted its mysteries.`);
  } catch (error) {
    console.error('Error sending DM to new member:', error);
  }
});

// Login the bot
client.login(process.env.DISCORD_TOKEN);
