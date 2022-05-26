require('dotenv').config()
const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });


client.once('ready', () => {
    console.log('Gazette on !');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('id de l\'avatar : ' + interaction.user.avatar + '\nNom du channel : ' + interaction.channel.name)
    } else if (commandName === 'server') {
        await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
    } else if (commandName === 'user') {
        await interaction.reply('User info.');
    }
});

client.login(process.env.TOKEN);

// const Canvas = require('canvas');
//
// //Welcome message
// var welcomeCanvas  = {};
// welcomeCanvas.create = Canvas.createCanvas(1024, 370)
// welcomeCanvas.context = welcomeCanvas.create.getContext('2d')
// welcomeCanvas.context.font = '20px sans-serif';
// welcomeCanvas.context.fillStyle = '#ffffff';

// Canvas.loadImage("./img/bg.png").then(async (img) => {
//     welcomeCanvas.context.drawImage(img, 0, 0, 1024, 370)
//     welcomeCanvas.context.beginPath();
//     welcomeCanvas.context.arc(175, 166, 128, 0, Math.PI * 2, true);
//     welcomeCanvas.context.stroke();
//     welcomeCanvas.context.fill();
//
// })

// client.on('guildMemberAdd', async member => {
//     const welcomeChannel = client.channels.cache.get('756778491940175876')
//     let canvas = welcomeCanvas;
//     canvas.context.font = '20px sans-serif',
//     canvas.context.textAlign = 'center';
//     canvas.context.fillText(member.user.tag.toUpperCase(), 175, 330)
//     canvas.context.font = '20px sans-serif'
//     canvas.context.beginPath()
//     canvas.context.arc(175, 166, 119, 0, Math.PI * 2, true)
//     canvas.context.closePath()
//     canvas.context.clip()
//     await Canvas.loadImage(member.user.displayAvatarURL({format: 'png', size: 1024}))
//     .then(img => {
//         canvas.context.drawImage(img, 56, 47, 238, 238);
//     })
//     let atta = new Discord.MessageAttachment(canvas.create.toBuffer(), `welcome-${member.id}.png`)
//     try {
//         welcomeChannel.send(`Bienvenue à toi ${member}.\nAvant de rejoindre les Gazettos, n'oublie pas de lire le règlement et de prendre ton/tes rôles dans <#892000849004470333> !`, atta)
//     } catch (error) {
//         console.log(error)
//     }
// })

