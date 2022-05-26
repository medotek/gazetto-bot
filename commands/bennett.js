module. exports = {
    name: 'bennett',
    description: 'fiche bennett',
    execute (client, message, args, Discord) {
        const Bennett1 = new Discord.MessageEmbed()
        .setColor('be1e00')
        .setTitle('Bennett')
        .setThumbnail('https://cdn.discordapp.com/attachments/902965188154785883/912087790303469658/Bennett_miniature.png')
        .setURL('https://www.hoyolab.com/article/3772851')
        .setDescription('Healer / Buffer')
        .setImage('https://cdn.discordapp.com/attachments/909420061297635390/951972138275987456/Bennett_Healer_-_Buffer.png')
        message.channel.send(Bennett1);

        const Bennett2 = new Discord.MessageEmbed()
        .setColor('be1e00')
        .setTitle('Bennett')
        .setThumbnail('https://cdn.discordapp.com/attachments/902965188154785883/912087790303469658/Bennett_miniature.png')
        .setURL('https://www.hoyolab.com/article/3772851')
        .setDescription('Support Pyro')
        .setImage('https://cdn.discordapp.com/attachments/909420061297635390/951972138661855322/Bennett_Support_Pyro.png')
        message.channel.send(Bennett2);
    },

}