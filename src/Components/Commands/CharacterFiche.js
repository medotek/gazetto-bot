import {Cache} from '../../Module/Cache.js'
import {getCharacterFiche} from "../../Request/Command/CharactersFiche.js";
import {characterFicheEmbedBuilder} from "../../Builder/Commands/EmbedBuilder.js";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder} from "discord.js";
import {navigationActionEmbedBuilder} from "../../Builder/Commands/NavigationActionEmbedBuilder.js";
import MiniSearch from 'minisearch'
import {config} from 'dotenv'
import {accentsTidy, rarityStar} from "../../Tools/index.js";
import gazetteDataProviderInstance from "../../DataProvider/Gazette.js";
import {weaponsSelectComponent} from "../../DTO/Commands/Weapons.js";

config()

export async function CharacterFiche(commandName, interaction) {
    if (commandName !== 'fiche') {
        return;
    }

    // Allowed channels part
    let channelsId = process.env.GUDA_FICHE_ALLOWED_CHANNELS_IDS
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
        return await interaction.reply({
            content: "Vous n'êtes pas autorisé à utiliser la commande sur ce salon",
            ephemeral: true
        })
    }

    let replyObj = {content: "Une erreur est survenue"}
    let isAutocomplete = !!parseInt(interaction.options.getString('personnage'))
    let result;
    if (isAutocomplete) {
        result = [{id: parseInt(interaction.options.getString('personnage'))}]
    } else {
        result = await handleCharacterSearch(interaction)
    }

    let characterFiche = await findCharacterFiche(interaction, result)

    if (characterFiche) {
        if (typeof characterFiche === 'string')
            replyObj.content = characterFiche;
        if (typeof characterFiche === 'object' && characterFiche.hasOwnProperty('embeds') && characterFiche.embeds.length)
            replyObj.embeds = characterFiche.embeds
        if (typeof characterFiche === 'object' && characterFiche.hasOwnProperty('components') && characterFiche.components.length)
            replyObj.components = characterFiche.components
        if (replyObj.hasOwnProperty('embeds') || replyObj.hasOwnProperty('components'))
            delete (replyObj.content)
    }

    replyObj.ephemeral = !!replyObj.content
    return await interaction.reply(replyObj)
}

async function handleCharacterSearch(interaction) {
    // TODO : remove mini search and do a pattern search
    let characters = await gazetteDataProviderInstance.charactersSheets(true)
    let searchTerm = interaction.options.getString('personnage')
    // Search engine
    let miniSearch = new MiniSearch({
        fields: ['name'],
        storeFields: ['name', 'id'],
        searchOptions: {
            fuzzy: 0.1
        }
    })

    if (characters && typeof characters === 'object' && searchTerm.length > 2) {
        // Add array for search index
        miniSearch.addAll(characters)

        let formattedCharacterName = accentsTidy(searchTerm, true)
        if (formattedCharacterName.length > 2) {
            return miniSearch.search(formattedCharacterName)
        }
    }

    return false;
}

export async function findCharacterFiche(interaction, result) {
    // TODO : if multiple entries, make the user to choose
    if (result && result.length === 1 && typeof result[0].id !== "undefined" && typeof result[0].id === "number" && result[0].id) {
        let response = {};
        let weapons = null;
        let actionRow = new ActionRowBuilder();

        let characterFiches = await getCharacterFiche(result[0].id)
        if (!characterFiches || !characterFiches.hasOwnProperty('result') || typeof characterFiches.result !== "object")
            return "Aucun personnage ne correspond à la recherche";
        if (!characterFiches || (characterFiches.hasOwnProperty('result') && !characterFiches.result) || !Object.keys(characterFiches.result).length)
            return "Le personnage ne possède pas de fiches";

        // Set weapons
        weapons = characterFiches.result[0].weapons

        // Multiple fiches
        if (Object.keys(characterFiches.result).length > 1) {
            let cacheKey = "userId" + interaction.user.id + "interactionId" + interaction.id
            let actionCharacterFiches = {
                current: 0, // Current key start at 0
                data: characterFiches.result
            }

            try {
                // Set cache for navigation actions
                Cache.set(cacheKey, actionCharacterFiches)
                let ficheEmbed = characterFicheEmbedBuilder(characterFiches.result[0])
                let navEmbed;
                let hasTwoObjs = false;
                let components = [];

                if (Object.keys(characterFiches.result).length === 2) {
                    // Display a second embed to show prev/next elements
                    navEmbed = await navigationActionEmbedBuilder(cacheKey, ficheEmbed, 'next')
                    hasTwoObjs = true;
                } else {
                    // Display a second embed to show prev/next elements
                    navEmbed = await navigationActionEmbedBuilder(cacheKey, ficheEmbed)
                }
                if (hasTwoObjs) {
                    actionRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`characterFicheNext_${interaction.id}_${interaction.user.id}`)
                            .setLabel('Suivant ➡')
                            .setStyle(ButtonStyle.Primary),
                    )
                } else {
                    actionRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`characterFichePrev_${interaction.id}_${interaction.user.id}`)
                            .setLabel('⬅ Précédent')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`characterFicheNext_${interaction.id}_${interaction.user.id}`)
                            .setLabel('Suivant ➡')
                            .setStyle(ButtonStyle.Primary),
                    )
                }

                if (navEmbed) {
                    response.components = components
                    response.embeds = [navEmbed]
                } else {
                    response.embeds = [ficheEmbed]
                }
            } catch (e) {
                // TODO : log
                console.error(e)
            }
        } else if (Object.keys(characterFiches.result).length === 1) {
            let ficheEmbed = characterFicheEmbedBuilder(characterFiches.result[0])
            response.embeds = ficheEmbed ? [ficheEmbed] : "Le personnage ne possède pas de fiches"
        }

        if (weapons && weapons.length) {
            let selectComponent = weaponsSelectComponent(weapons)
            if (selectComponent) {
                if (!response.hasOwnProperty('components'))
                    response.components = []

                response.components.push(new ActionRowBuilder().addComponents(selectComponent));
            }
        }

        if (actionRow.components.length)
            response.components.push(actionRow);

        return response
    }
}
