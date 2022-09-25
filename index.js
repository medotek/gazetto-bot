import {config} from  'dotenv'
// Init dotenv config
config()
// Import modules
import {ActivityType, Client, GatewayIntentBits, Partials} from 'discord.js'
const client = new Client({intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel]});
// Import commands
import {Commands} from './src/Components/commands.js'
import {deployCommands} from "./src/Scripts/deploy-commands.js";
import {sequelize} from "./src/Services/DatabaseService.js";
// DB connection

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
        // Deploy commands
        await deployCommands()

        await client.login(process.env.TOKEN);

        client.on("ready", () => {
            client.user.setActivity("/kibo", { type: ActivityType.Watching})
        })

        client.once('ready', () => {
            console.log('Kibo is ready')
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

