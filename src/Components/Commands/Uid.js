import {UserDataProvider} from '../../DataProvider/UserDataProvider.js'
import {Cache} from '../../Module/Cache.js'
import {InteractionType} from "discord-api-types/v10";
import {getUserUidData} from "../../DTO/Commands/Uid/UserFromCacheDTO.js";
import {userUidEmbedBuilder} from "../../Builder/Commands/EmbedBuilder.js";

export async function Uid(sequelize, commandName, interaction) {
    /**
     * SET UID COMMAND
     */
    let response = {
        message: 'An error occurred, medo help!'
    };

    if (commandName === 'set-uid') {
        if (await allowChannels(interaction)) {
            return;
        }
        // Allowed channels part
        let pseudo = interaction.options.get('pseudo');
        let uid = interaction.options.get('uid');
        const {user} = interaction
        if (pseudo.value && uid.value) {
            response = await UserDataProvider('update', sequelize, user, uid.value, pseudo.value.replace(/[^a-zA-Z0-9]/g, ""))
        }
        // Clear cache if exists
        let cacheKey = 'get-uid' + user.id
        if (Cache.has(cacheKey)
            && typeof response.data === "object"
            && response.data !== undefined
            && Object.keys(response.data).length) {
            Cache.clear(cacheKey)
        }
        await interaction.reply({content: response.message, ephemeral: true})
    }

    /**
     * GET UID COMMAND
     */
    if (commandName === 'get-uid') {
        if (await allowChannels(interaction)) {
            return;
        }
        let ephemeralStatus = true;
        let replyObject = {}
        let targetUser = interaction.options._hoistedOptions[0]
        // Gestion du cache
        let cacheKey = 'get-uid' + targetUser.user.id;
        response = await getUserUidData(cacheKey, targetUser.user)
        // Get data from database
        let embed = null;
        if (response.data) {
            embed = userUidEmbedBuilder(response.data, targetUser.user)
        }
        replyObject.content = response.message
        if (response.status !== 'error') ephemeralStatus = false;
        if (embed) replyObject.embeds = [embed]
        else ephemeralStatus = true;
        replyObject.ephemeral = ephemeralStatus
        await interaction.reply(replyObject)
    }
}

export async function GetUidFromUserMenuContext(interaction) {
    let replyObj = {
        ephemeral: true
    }
    let response, embed = null
    if (InteractionType.ApplicationCommand) {
        // targetId as discord userId
        const {user} = interaction.options.get('user')
        if (user && typeof user === "object") {
            let cacheKey = 'get-uid' + interaction.targetId
            // Gestion du cache
            response = await getUserUidData(cacheKey, user)
            if (response.data) {
                embed = userUidEmbedBuilder(response.data, user)
            }
            if (embed) {
                replyObj.embeds = [embed]
                replyObj.content = response.message
            }

            replyObj.content = response.message
        }
    }

    if (!response) {
        replyObj.content = "Commande invalide"
    }

    return await interaction.reply(replyObj)
}


/**
 * @param interaction
 * @returns {Promise<boolean>}
 */
async function allowChannels(interaction) {
    let channelsId = process.env.GUDA_UID_ALLOWED_CHANNELS_ID
    let notAllowed = true;
    let channels = null
    if (channelsId) {
        channels = channelsId.split(',')
        channels.forEach(channel => {
            if (channel === interaction.channelId) {
                notAllowed = false;
                return true;
            }
        })
    }

    if (notAllowed || typeof channels !== 'object') {
        await interaction.reply({
            content: "Vous n'êtes pas autorisé à utiliser la commande sur ce salon",
            ephemeral: true
        })

        return true;
    }

    return false;
}
