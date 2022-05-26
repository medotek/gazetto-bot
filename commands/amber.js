module. exports = {
    name: 'amber',
    description: 'fiche amber',
    execute (client, message, args, Discord) {
        const Amber = new Discord.MessageEmbed()
        .setColor('be1e00')
        .setTitle('Amber')
        .setThumbnail('https://cdn.discordapp.com/attachments/909420061297635390/923251779288825906/Amber.png')
        .setURL('https://www.hoyolab.com/article/1734925')
        .setDescription('Support / Sub DPS')
        .setImage('https://cdn.discordapp.com/attachments/909420061297635390/949792089460318238/Amber.png')
        message.channel.send(Amber);
    }

}