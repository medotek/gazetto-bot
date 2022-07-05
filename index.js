require('dotenv').config()
const {Client, Intents, MessageSelectMenu, MessageActionRow} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS]});
const {GenshinKit, util} = require('@genshin-kit/core');
const { Sequelize } = require('sequelize');
const genshin = new GenshinKit()
// DB connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PWD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    dialectOptions: {
        connectTimeout:100000
    }
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

