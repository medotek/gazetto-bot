import {Cache} from '../../Module/Cache.js'
import {getCharacterFiche} from "../../Request/Command/CharactersFiche.js";
import {characterFicheEmbedBuilder} from "../../Builder/Commands/EmbedBuilder.js";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import {navigationActionEmbedBuilder} from "../../Builder/Commands/NavigationActionEmbedBuilder.js";
import MiniSearch from 'minisearch'
import {config} from 'dotenv'
import {accentsTidy} from "../../Tools/index.js";
import gazetteDataProviderInstance from "../../DataProvider/Gazette.js";

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
    let role = interaction.options.get('role')
    let result;
    if (isAutocomplete) {
        result = [{id: parseInt(interaction.options.getString('personnage'))}]
    } else {
        result = await handleCharacterSearch(interaction)
    }

    let characterFiche = await findCharacterFiche(interaction, result, role)

    if (characterFiche) {
        if (typeof characterFiche === 'string')
            replyObj.content = characterFiche;
        if (typeof characterFiche === 'object' && characterFiche.hasOwnProperty('embeds') &&  characterFiche.embeds.length)
            replyObj.embeds = characterFiche.embeds
        if (typeof characterFiche === 'object' && characterFiche.hasOwnProperty('components') && characterFiche.components.length)
            replyObj.components = characterFiche.components
        if (replyObj.hasOwnProperty('embeds') || replyObj.hasOwnProperty('components'))
            delete(replyObj.content)
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

async function findCharacterFiche(interaction, result, role = null) {
    // TODO : if multiple entries, make the user to choose
    if (result && result.length === 1 && typeof result[0].id !== "undefined" && typeof result[0].id === "number" && result[0].id) {
        let roles = null;

        // Optional condition
        if (role && typeof role === "object" && role.hasOwnProperty('value') && role.value)
            roles = JSON.stringify({'role': role.value});

        let characterFiches = await getCharacterFiche(result[0].id, roles)
        if (!characterFiches || typeof role !== "object" || !characterFiches.hasOwnProperty('result') || typeof characterFiches.result !== "object")
            return "Aucun personnage ne correspond à la recherche";
        if (!characterFiches || (characterFiches.hasOwnProperty('result') && !characterFiches.result) || !Object.keys(characterFiches.result).length)
            return "Le personnage ne possède pas de fiches";

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
                let navEmbed = null;
                let hasTwoObjs = null;
                if (Object.keys(characterFiches.result).length === 2) {
                    // Display a second embed to show prev/next elements
                    navEmbed = await navigationActionEmbedBuilder(cacheKey, ficheEmbed, 'next')
                    hasTwoObjs = true;
                } else {
                    // Display a second embed to show prev/next elements
                    navEmbed = await navigationActionEmbedBuilder(cacheKey, ficheEmbed)
                }
                let row = null
                if (hasTwoObjs) {
                    row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('characterFicheNext_' + interaction.id)
                                .setLabel('Suivant ➡')
                                .setStyle(ButtonStyle.Primary),
                        );
                } else {
                    row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('characterFichePrev_' + interaction.id)
                                .setLabel('⬅ Précédent')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId('characterFicheNext_' + interaction.id)
                                .setLabel('Suivant ➡')
                                .setStyle(ButtonStyle.Primary),
                        );
                }

                if (navEmbed) {
                    return {
                        embeds: [navEmbed],
                        components: [row]
                    }
                } else {
                    return {
                        embeds: [ficheEmbed]
                    }
                }
            } catch (e) {
                // TODO : log
                console.log(e)
            }
        } else if (Object.keys(characterFiches.result).length === 1) {
            let ficheEmbed = characterFicheEmbedBuilder(characterFiches.result[0])
            return ficheEmbed ? {embeds: [ficheEmbed]} : "Le personnage ne possède pas de fiches"
        }
    }
}
