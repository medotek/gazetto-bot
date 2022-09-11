import {config} from  'dotenv'
// Init dotenv config
config()
// Import modules
import {Client, Intents, MessageSelectMenu, MessageActionRow} from 'discord.js'
const client = new Client({intents: [Intents.FLAGS.GUILDS]});
import { Sequelize } from 'sequelize'
// Import commands
import {Commands} from './src/Components/commands.js'
// DB connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PWD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    dialectOptions: {
        connectTimeout:100000
    }
});

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

app().then(async r => {
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
    //
    // // GENSHIN KIT Setup
    // genshin.loginWithCookie(process.env.COOKIE).setServerType('os').setServerLocale('fr-fr');

    // Commands
    await (async () => {
        await sequelize.sync({force: true});
        await Commands(client, sequelize)
    })();

})

