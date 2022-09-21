import {Cache} from '../../Module/Cache.js'
import {getCharacterFiche, getCharacters} from "../../Request/Command/CharactersFiche.js";
import {characterFicheEmbedBuilder} from "../../Builder/Commands/EmbedBuilder.js";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import {navigationActionEmbedBuilder} from "../../Builder/Commands/NavigationActionEmbedBuilder.js";
import MiniSearch from 'minisearch'
import {config} from 'dotenv'

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

    let charactersFicheKey = "ficheCharacters"
    const characters = await Cache.retrieve(charactersFicheKey)
    if (!characters || typeof characters !== "object") {
        console.log('test')
        let charactersRequest = await getCharacters()
        let charactersArr = []
        if (charactersRequest && typeof charactersRequest === "object") {
            for (const [key, character] of Object.entries(charactersRequest)) {
                charactersArr.push({name: character.name, id: character.id})
            }
            Cache.set(charactersFicheKey, charactersArr)
        }
    }

    let characterSearchTerm = interaction.options.get('personnage')
    let role = interaction.options.get('role')
    let embeds = [];
    let replyObj = {content: "Une erreur est survenue"}
    // Search engine
    let miniSearch = new MiniSearch({
        fields: ['name'],
        storeFields: ['name', 'id'],
        searchOptions: {
            fuzzy: 0.2
        }
    })

    if (characters && typeof characters === 'object') {
        // Add array for search index
        miniSearch.addAll(characters)

        if (characterSearchTerm && typeof characterSearchTerm === "object" && characterSearchTerm.hasOwnProperty('value')) {
            if (characterSearchTerm.value.length > 2) {
                let result = miniSearch.search(characterSearchTerm.value)
                if (result.length) {
                    replyObj.content = null
                    if (result.length === 1) {
                        if (result[0].id !== "undefined" && typeof result[0].id === "number" && result[0].id) {
                            let roles = null;
                            // Optional condition
                            if (role && typeof role === "object" && role.hasOwnProperty('value') && role.value) {
                                roles = JSON.stringify({'role': role.value})
                            }

                            // TODO : découpage
                            let characterFiches = await getCharacterFiche(result[0].id, roles)
                            if (characterFiches && typeof role === "object" && characterFiches.hasOwnProperty('result') && typeof characterFiches.result === "object") {
                                // TODO : watch
                                // replyObj.content = null;
                                if (characterFiches.result && Object.keys(characterFiches.result).length) {
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
                                                embeds.push(navEmbed)
                                                // Action Row
                                                replyObj.components = [row]
                                            } else {
                                                embeds.push(ficheEmbed)
                                            }
                                        } catch (e) {
                                            // TODO : log
                                            console.log(e)
                                        }
                                    } else if (Object.keys(characterFiches.result).length === 1) {
                                        let ficheEmbed = characterFicheEmbedBuilder(characterFiches.result[0])
                                        ficheEmbed ? embeds.push(ficheEmbed) : replyObj.content = "Le personnage ne possède pas de fiches"
                                    }
                                } else {
                                    replyObj.content = "Le personnage ne possède pas de fiche";
                                }
                            }
                        }
                    } else {
                        // for multiple (characters) results
                        // for (const [key, res] of Object.entries(result)) {
                        //     console.log(res)
                        // }
                        // TODO : if multiple result, return a format for those possibilities
                        replyObj.content = "Aucun personnage ne correspond à la recherche"
                    }
                } else {
                    replyObj.content = "Aucun personnage ne correspond à la recherche"
                }
            } else {
                replyObj.content = "Veuillez effectuer une recherche comprenant au minimum 3 lettres"
            }
        }
    }


    if (replyObj.content)
        replyObj.ephemeral = true
    if (embeds.length)
        replyObj.embeds = embeds

    await interaction.reply(replyObj)
}
