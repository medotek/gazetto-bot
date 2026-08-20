import {config} from  'dotenv'
// Init dotenv config
config({ quiet: true })
// Import modules
import {ActivityType, Client, Events, GatewayIntentBits, Partials} from 'discord.js'
const client = new Client({intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel]});
// Import commands
import {Commands} from './Components/commands.js'
import {deployCommands} from "./Scripts/deploy-commands.js";
import {sequelize} from "./Services/DatabaseService.js";
import {EnkaClient} from "enka-network-api";
import {StarRail} from "starrail.js";
import gazetteDataProviderInstance from "./DataProvider/Gazette.js";

/**
 * Update cached data
 *
 * @type {StarRail}
 */
export const starRailClient = new StarRail({ cacheDirectory: "./cache/star-rail" });
starRailClient.cachedAssetsManager.activateAutoCacheUpdater({
    // instant: true, // Run the first update check immediately
    timeout: 24* 60 * 60 * 1000, // 1 day interval
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
await genshinClient.cachedAssetsManager.activateAutoCacheUpdater({
    // instant: true, // Run the first update check immediately
    timeout: 24* 60 * 60 * 1000, // 1 day interval
    onUpdateStart: async () => {
        console.log("Updating Genshin  Data...");
    },
    onUpdateEnd: async () => {
        genshinClient.cachedAssetsManager.refreshAllData(); // Refresh memory
        console.log("[GENSHIN] Updating Completed!");
    }
})


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
        // Warm both formatting variants in cache before going online so the
        // first autocomplete / fiche never has to wait on the API.
        await gazetteDataProviderInstance.charactersSheets(false)
        await gazetteDataProviderInstance.charactersSheets(true)
        // Keep them warm in the background (force refresh) so user interactions
        // always hit memory and stay within Discord's 3s autocomplete deadline.
        setInterval(async () => {
            await gazetteDataProviderInstance.charactersSheets(false, true)
            await gazetteDataProviderInstance.charactersSheets(true, true)
        }, 30*60*1000)

        // Deploy commands
        await deployCommands()

        await client.login(process.env.TOKEN);

        client.on(Events.ClientReady, () => {
            client.user.setActivity("/kibo", { type: ActivityType.Watching})
        })

        client.once(Events.ClientReady, () => {
            console.log('Kibo is ready')
        });
    } else {
        console.log(r.message)
    }

    // Commands
    await (async () => {
        await sequelize.sync({force: false});
        await Commands(client, sequelize)
    })();
})

