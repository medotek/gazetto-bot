import {Uid} from "./Commands/Uid.js";
import {InteractionType} from "discord-api-types/v10";
import {CharacterFiche} from "./Commands/CharacterFiche.js";

export const Commands = (client, sequelize) => {
    client.on('interactionCreate', async interaction => {
        if (interaction.type === InteractionType.ApplicationCommand) {
            const {commandName, user} = interaction;
            // Set/Get Uid Command
            await Uid(sequelize, commandName, interaction)
            // Fiche Command
            await CharacterFiche(commandName, interaction)
        }
    })
}

/*
TODO : Note utile
const row = new MessageActionRow()
    .addComponents(
        new MessageSelectMenu()
            .setCustomId('select')
            .setPlaceholder('Nothing selected')
            .addOptions([
                {
                    label: 'Je réponds oui',
                    description: 'Ce bot vous répondra positivement',
                    value: 'yes',
                },
                {
                    label: 'Je réponds non',
                    description: 'Ce bot vous répondra négativement',
                    value: 'no',
                },
            ]),
    );

await interaction.reply({content: 'Oui ou Non', components: [row], ephemeral: true});

<:genshin_tombaie:974255896513359892>

 * SELECT MENU INTERACTION
client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;

    // If the user used the select menu
    if (interaction.customId === 'select') {
        // Always the first value
        switch (interaction.values[0]) {
            case 'yes':
                await interaction.update(`<@${interaction.user.id}> oui`)
                break
            case 'no' :
                await interaction.update({content: `<@${interaction.user.id}> non`, ephemeral: true})
                break
        }
    }
})
*/

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
