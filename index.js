require('dotenv').config()
const {Client, Intents, MessageSelectMenu, MessageActionRow} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS]});
const {GenshinKit, util} = require('@genshin-kit/core');
const { Sequelize } = require('sequelize');
const genshin = new GenshinKit()
// DB connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PWD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});
// Import commands
const Commands = require('./src/Components/commands')

const app = async () =>  {
    try {
        await sequelize.authenticate()
        return {
            status: 'success',
            message: 'Connection has been established successfully.'
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Unable to connect to the database:' + error
        }
    }
}

app().then(r => {
    if (r.status === 'success') {
        client.login(process.env.TOKEN).then(res => {
            console.log('Client on')
        });

        client.once('ready', () => {
            console.log('Gazette on !');
        });

    } else {
        console.log(r.message)
    }

    // GENSHIN KIT Setup
    genshin.loginWithCookie(process.env.COOKIE).setServerType('os').setServerLocale('fr-fr');

    // Commands
    (async () => {
        await sequelize.sync({ force: true });
        await Commands(client, sequelize)
    })();

})

/*
var createTableIfNotExists = 'CREATE TABLE IF NOT EXISTS ' + process.env.DB_NAME + '.discord_uid (userId BIGINT NOT NULL UNIQUE,uid INT NOT NULL,name VARCHAR(100) DEFAULT NULL))';

var connected = false;
DbConnection.connect(function (err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
    connected = true;
});


// FUNCTIONS TO EXPORT
const existingData = async (userId, uuid, nickname) => {
    // Not EU uid
    if (uuid > 800000000 || uuid < 700000000) {
        return {
            status: 'error',
            detail: "L'uid est invalide"
        }
    }

    // TODO : search for userId first
    let existsUserId = await DbConnection.query('SELECT * FROM ' + process.env.DB_NAME + '.discord_uid WHERE userId = ' + userId, function (err, result) {
        if (err) {
            return false;
        } else {
            return JSON.parse(JSON.stringify(result))
        }
    });

    if (existsUserId) {
        let query = 'UPDATE discord_uid SET ';
        if (nickname) {
            query += 'nickname = "' + nickname + '"'
        }
        if (uuid) {
            if (nickname) {
                query += ','
            }
            query += ' uid = ' + uuid;
        }
        query += ' WHERE userId = ' + userId

        return await DbConnection.query(query, function (err, result) {
            if (err) {
                return false
            } else {
                if (Array.isArray(result)) {
                    if (result.length) {
                        return {
                            status: 'success',
                            detail: 'updated'
                        }
                    } else {
                        return {
                            status: 'success',
                            detail: 'cannot be updated'
                        }
                    }
                }
            }
        })
    }
    return false;
}
const insertDiscordUid = (userId, uid, nickname) => {
    return 'INSERT INTO discord_uid VALUES (' + userId + ',' + uid + ',"' + nickname + '")'
};

/**
 * COMMAND INTERACTION
 */
client.on('interactionCreate', async interaction => {
    const findOption = (name) => {
        return interaction.options._hoistedOptions.find(element => element.name === name)
    }

    if (!interaction.isCommand()) return;
    const {commandName} = interaction;
    switch (commandName) {
        case 'set-uid':

            break;
        case 'get-uid' :
            let userOption = interaction.options._hoistedOptions[0]
            let embed = null
            let existsUidForUser = await DbConnection.query('SELECT * FROM discord_uid WHERE userId = ' + userOption.user.id, async function (err, result) {
                if (err) {
                    return false
                } else {
                    let userUid = JSON.parse(JSON.stringify(result))
                    userUid = userUid[0]
                    console.log(userUid)
                    return {
                        status: 'success',
                        data: userUid
                    }
                }
            })

            let replyObj = {ephemeral: false}
            if (existsUidForUser) {
                console.log(existsUidForUser.data)
                //existsUidForUser.data => { userId: 241643296328253440, uid: 700181708, nickname: 'testsefse' }
                // TODO : pour accéder à ces données(ex: existsUidForUser.data.userId)
                // existsUidForUser.data.userId = 241643296328253440
                embed = {
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
                let hasError = false;
                let genshinResponse = await genshin.getUserRoles(existsUidForUser.data.uid)
                    .then(function (result) {
                        for (const [key, value] of Object.entries(result)) {
                            console.log(value)
                            if (value.id) {
                                let { name } = value
                                replyObj.content += name + '\n'
                            }
                        }
                })
                    .catch(function (error) {
                        hasError = true
                        console.log(error)
                    })

                if (genshinResponse.code === 1009) {
                    replyObj.content = 'UID inconnu'
                } else if (hasError) {
                    replyObj.content = 'Pas de personnages sur la vitrine de l\'utilisateur'
                }
                // LIEN de l'image : `https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.jpg`
            } else {
                replyObj.content = existsUidForUser.detail ?? 'error'
            }

            if (embed) {
                replyObj.embeds = [embed]
            }

            console.log(replyObj)
            if (embed) {
                replyObj.content = replyObj.content ?? 'Empty message'
                await interaction.reply(replyObj)
            }
            break;
        case
        'test'
        :
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
            break;
        case
        'boop'
        :
            await interaction.reply({
                content: `<@${interaction.user.id}>, je t'ai mentionné ! ahaha ... ahah ... ah?* <:genshin_tombaie:974255896513359892>`,
                ephemeral: true
            })
            break;
    }
})
;


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
                await interaction.update({content: `<@${interaction.user.id}> non`, ephemeral: true})
                break
        }
    }
})


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

