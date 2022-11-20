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
        await interaction.showModal(setUidModal());
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

function setUidModal() {
    const modal = new ModalBuilder()
        .setCustomId('setUidModal')
        .setTitle('Enregistrement de l\'UID');

    const nicknameInput = new TextInputBuilder()
        .setCustomId('setUidNickname')
        // The label is the prompt the user sees for this input
        .setLabel("Ton pseudo sur Genshin")
        // Short means only a single line of text
        .setStyle(TextInputStyle.Short);

    const uidInput = new TextInputBuilder()
        .setCustomId('setUidNumber')
        .setLabel("Ton UID Genshin")
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Short);

    // An action row only holds one text input,
    // so you need one action row per text input.
    const firstActionRow = new ActionRowBuilder().addComponents(nicknameInput);
    const secondActionRow = new ActionRowBuilder().addComponents(uidInput);

    // Add inputs to the modal
    return modal.addComponents(firstActionRow, secondActionRow);
}
