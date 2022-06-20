require('dotenv').config()
const { Client, Intents, MessageSelectMenu, MessageActionRow} = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { GenshinKit, util } = require('@genshin-kit/core');
const genshin = new GenshinKit()

genshin.loginWithCookie(process.env.COOKIE).setServerType('os').setServerLocale('fr-fr')

client.once('ready', () => {
    console.log('Gazette on !');
});

/**
 * COMMAND INTERACTION
 */
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;
    switch (commandName) {
        case 'set-uid':
            // TODO enregistrer les données
            break;
        case 'get-uid' :
            let errors = [];
            if (interaction.options._hoistedOptions.length > 1) {
                errors.push('Veuillez n\'entrer qu\'un uid')
            }
            // return error - invalid value (empty or null)
            if (!interaction.options._hoistedOptions[0].value) {
                errors.push('Uid invalide')
            }

            if (errors.length > 0) {
                let response = '';
                errors.forEach(err => {
                    response += err + '\n';
                })
                await interaction.reply({content: response, ephemeral: true})
            } else {
                let uid = parseInt(interaction.options._hoistedOptions[0].value)
                let response = 'test';
                let embed = {
                    "title": "title ~~(did you know you can have markdown here too?)~~",
                    "description": "this supports [named links](https://discordapp.com) on top of the previously shown subset of markdown. ```\nyes, even code blocks```",
                    "url": "https://discordapp.com",
                    "color": 1753330,
                    "timestamp": "2022-06-20T21:15:43.123Z",
                    "footer": {
                        "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
                        "text": "footer text"
                    },
                    "thumbnail": {
                        "url": "https://cdn.discordapp.com/embed/avatars/0.png"
                    },
                    "image": {
                        "url": "https://cdn.discordapp.com/embed/avatars/0.png"
                    },
                    "author": {
                        "name": "author name",
                        "url": "https://discordapp.com",
                        "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png"
                    },
                    "fields": [
                        {
                            "name": "🤔",
                            "value": "some of these properties have certain limits..."
                        }
                    ]
                }
                // TODO : Afficher l'uid, le pseudo et un lien vers enka,
                // TODO : + (facultatif) récupérer l'image de l'utilisateur
                // ->
                // let hasError = false;
                // await genshin.getUserRoles(uid)
                //     .then(function (result) {
                //         for (const [key, value] of Object.entries(result)) {
                //             console.log(value)
                //             if (value.id) {
                //                 let { name } = value
                //                 response += name + '\n'
                //             }
                //         }
                // })
                //     .catch(function (error) {
                //         hasError = true
                //         response = error
                //         console.log(error)
                //     })
                //
                // if (response.code === 1009) {
                //     response = 'UID inconnu'
                // } else if (hasError) {
                //     response = 'Pas de personnages sur la vitrine de l\'utilisateur'
                // }
                console.log(interaction.user);
                // LIEN de l'image : `https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.jpg`
                await interaction.reply({content: response, ephemeral: false, embeds: [embed]})
            }
            break;
        case 'test' :
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

            await interaction.reply({ content: 'Oui ou Non', components: [row], ephemeral: true});
            break;
        case 'boop' :
            await interaction.reply({content: `<@${interaction.user.id}>, je t'ai mentionné ! ahaha ... ahah ... ah?* <:genshin_tombaie:974255896513359892>`, ephemeral: true})
            break;
    }
});


/**
 * SELECT MENU INTERACTION
 */
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
                await interaction.update({content:`<@${interaction.user.id}> non`, ephemeral: true})
                break
        }
    }
})

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

