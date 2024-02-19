import {config} from  'dotenv'
// Init dotenv config
config()
// Import modules
import {ActivityType, Client, GatewayIntentBits, Partials} from 'discord.js'
const client = new Client({intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel]});
// Import commands
import {Commands} from './Components/commands.js'
import {deployCommands} from "./Scripts/deploy-commands.js";
import {sequelize} from "./Services/DatabaseService.js";
import {EnkaClient} from "enka-network-api";
import {StarRail} from "starrail.js";

/**
 * Update cached data
 *
 * @type {StarRail}
 */
export const starRailClient = new StarRail({ cacheDirectory: "./cache/star-rail" });
await starRailClient.cachedAssetsManager.cacheDirectorySetup();
await starRailClient.cachedAssetsManager.activateAutoCacheUpdater({
    instant: true, // Run the first update check immediately
    timeout: 60 * 60 * 1000, // 1 hour interval
    onUpdateStart: async () => {
        console.log("Updating Star Rail Data...");
    },
    onUpdateEnd: async () => {
        starRailClient.cachedAssetsManager.refreshAllData(); // Refresh memory
        console.log("[STAR RAIL] Updating Completed!");
    }
});

/**
 * Update cached data
 *
 * @type {EnkaClient}
 */
export const genshinClient = new EnkaClient({ cacheDirectory: "./cache/genshin" })
await genshinClient.cachedAssetsManager.cacheDirectorySetup();
await genshinClient.cachedAssetsManager.activateAutoCacheUpdater({
    instant: true, // Run the first update check immediately
    timeout: 60 * 60 * 1000, // 1 hour interval
    onUpdateStart: async () => {
        console.log("Updating Genshin Data...");
    },
    onUpdateEnd: async () => {
        genshinClient.cachedAssetsManager.refreshAllData(); // Refresh memory
        console.log("Updating Completed!");
    }
});


/**
 * Start a DB instance
 * @returns {Promise<{message: string, status: string}>}
 */
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
            console.log('Kibo is ready')

            let activitiesTypes = [
                ActivityType.Watching,
                ActivityType.Competing,
                ActivityType.Listening,
                ActivityType.Streaming
            ]

            setInterval(function() {
                client.user.setActivity("/kibo", {type: activitiesTypes[Math.floor(Math.random() * activitiesTypes.length)]})
            }, 5000)
        })

    } else {
        console.log(r.message)
    }

    // Commands
    await (async () => {
        await sequelize.sync({force: false});
        await Commands(client, sequelize)
    })();

})

