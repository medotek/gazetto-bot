import {InteractionType, TextInputStyle} from "discord-api-types/v10";
import {userUidEmbedBuilder} from "../../Builder/Commands/EmbedBuilder.js";
import {ActionRowBuilder, ModalBuilder, TextInputBuilder} from "discord.js";
import UserDataProvider from "../../DataProvider/User.js";
import {Game} from "../../Tools/index.js";

export async function Uid(sequelize, commandName, interaction) {
    /**
     * SET UID COMMAND
     */
    let response = {
            message: 'An error occurred, medo help!'
    };

    if (commandName === 'set-uid') {
        /***********************************/
        /************ SHOW MODAL ***********/
        /***********************************/
        // Show the modal to the user
        await interaction.showModal(await setUidModal(interaction));
    }

    /**
     * GET UID COMMAND
     */
    if (commandName === 'get-uid') {
        if (await allowChannels(interaction))
            return;

        let ephemeralStatus = true;
        let replyObject = {content: "Error thrown in get-uid command"}
        let targetUser = interaction.options.getUser('user')
        let game = interaction.options.getString('game')
        let embed = null;

        if (!game)
            return await interaction.reply(replyObject)

        // Provide user data
        let userData = new UserDataProvider(targetUser)
        response = await userData.getGameUid(game)

        // Build data for embedding in discord
        if (response && response.data) {
            embed = await userUidEmbedBuilder(response.data, targetUser, game)
            embed ? replyObject.embeds = [embed] : ephemeralStatus = true
            delete(replyObject.content);
        }

        if (response.status !== 'error')
            ephemeralStatus = false;

        replyObject.ephemeral = ephemeralStatus
        await interaction.reply(replyObject)
    }
}

/**
 * Need a fix
 * @deprecated
 * @param interaction
 * @return {Promise<*>}
 * @constructor
 */
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
            // TODO : invalid func
            //  Reply ephemeral response + add buttons for genshin or honkai profile
            response = await getUserUidData(cacheKey, user)
            if (response.data) {
                embed = await userUidEmbedBuilder(response.data, user)
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
 * Handle permission
 * @param interaction
 * @returns {Promise<boolean>}
 */
async function allowChannels(interaction) {
    let channelsId = process.env.GUDA_UID_ALLOWED_CHANNELS_ID
    let notAllowed = true;
    let channels = channelsId.split(',')
    if (channelsId && channels.length) {
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

async function setUidModal(interaction) {
    let game = interaction.options.getString('game');
    if (!game) throw new Error('No game found');

    const modal = new ModalBuilder()
        .setCustomId(`setUidModal_${game}`)
        .setTitle('Enregistrement de l\'UID');

    const uidInput = new TextInputBuilder()
        .setCustomId('setUidNumber')
        .setLabel("Ton UID " + (game === Game.Genshin ? "Genshin" : "Star Rail"))
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Short)
        .setMinLength(0)
        .setMaxLength(9);

    /*************************************/
    /******** AUTOCOMPLETE VALUES ********/
    /*************************************/
    if (typeof interaction === 'object' && interaction.hasOwnProperty('user') && interaction.options.getString('game')) {
        if (typeof interaction.user.id !== 'undefined') {
            try {
                let userData = await (new UserDataProvider(interaction.user))
                    .getGameUid(interaction.options.getString('game'))

                if (typeof userData !== 'undefined' && userData.hasOwnProperty('data')) {
                    let data = userData.data
                    if (data && data.hasOwnProperty('uid') && data.hasOwnProperty('name')
                        && typeof data.uid !== 'undefined'
                        && typeof data.name !== 'undefined') {
                        uidInput.setValue(userData.data.uid.toString())
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    return modal.addComponents(
        new ActionRowBuilder().addComponents(uidInput)
    );
}
