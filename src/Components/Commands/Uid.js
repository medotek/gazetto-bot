import {InteractionType, TextInputStyle} from "discord-api-types/v10";
import {getUserUidData} from "../../DTO/Commands/Uid/UserFromCacheDTO.js";
import {userUidEmbedBuilder} from "../../Builder/Commands/EmbedBuilder.js";
import {ActionRowBuilder, ModalBuilder, TextInputBuilder} from "discord.js";

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

async function setUidModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('setUidModal')
        .setTitle('Enregistrement de l\'UID');

    const nicknameInput = new TextInputBuilder()
        .setCustomId('setUidNickname')
        // The label is the prompt the user sees for this input
        .setLabel("Ton pseudo sur Genshin")
        // Short means only a single line of text
        .setStyle(TextInputStyle.Short)
        .setMinLength(0)
        .setMaxLength(30);

    const uidInput = new TextInputBuilder()
        .setCustomId('setUidNumber')
        .setLabel("Ton UID Genshin")
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Short)
        .setMinLength(0)
        .setMaxLength(9);

    /*************************************/
    /******** AUTOCOMPLETE VALUES ********/
    /*************************************/
    if (typeof interaction === 'object' && interaction.hasOwnProperty('user')) {
        if (typeof interaction.user.id !== 'undefined') {
            let cacheKey = 'get-uid' + interaction.user.id;
            try {
                let userData = await getUserUidData(cacheKey, interaction.user)
                if (typeof userData !== 'undefined' && userData.hasOwnProperty('data')) {
                    let data = userData.data
                    if (data.hasOwnProperty('uid') && data.hasOwnProperty('name')
                        && typeof data.uid !== 'undefined'
                        && typeof data.name !== 'undefined') {
                        nicknameInput.setValue(userData.data.name.toString())
                        uidInput.setValue(userData.data.uid.toString())
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    const firstActionRow = new ActionRowBuilder().addComponents(nicknameInput);
    const secondActionRow = new ActionRowBuilder().addComponents(uidInput);
    modal.addComponents(firstActionRow, secondActionRow);
    return modal;
}
