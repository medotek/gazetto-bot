import {Cache} from '../../Module/Cache.js'
import {getCharacterFiche} from "../../Request/Command/CharactersFiche.js";
import {characterFicheEmbedBuilder} from "../../Builder/Commands/EmbedBuilder.js";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import {navigationActionEmbedBuilder} from "../../Builder/Commands/NavigationActionEmbedBuilder.js";

export async function CharacterFiche(commandName, interaction) {
    if (commandName !== 'fiche') {
        return;
    }

    if (interaction.channelId !== '974701611995779123') {
        return await interaction.reply({
            content: "Vous n'êtes pas autorisé à utiliser la commande sur ce salon",
            ephemeral: true
        })
    }

    let character = interaction.options.get('personnage')
    let role = interaction.options.get('role')
    let embeds = [];
    let replyObj = {}

    if (character && typeof character === "object" && character.hasOwnProperty('value')) {
        let roles = null;
        // Optional condition
        if (role && typeof role === "object" && role.hasOwnProperty('value') && role.value) {
            roles = JSON.stringify({'role': role.value})
        }

        let characterFiches = await getCharacterFiche(character.value, roles)
        if (characterFiches && typeof role === "object" && characterFiches.hasOwnProperty('result')) {
            if (characterFiches.result && Object.keys(characterFiches.result).length) {
                // Multiple fiches
                if (Object.keys(characterFiches.result).length > 1) {
                    let cacheKey = "userId" + interaction.user.id + "interactionId" + interaction.id
                    let actionCharacterFiches = {
                        current: 0, // Current key start at 0
                        data: characterFiches.result
                    }
                    // Set cache for navigation actions
                    Cache.set(cacheKey, actionCharacterFiches)
                    let ficheEmbed = characterFicheEmbedBuilder(characterFiches.result[0])
                    // Display a second embed to show prev/next elements
                    let navEmbed = await navigationActionEmbedBuilder(cacheKey, ficheEmbed)
                    navEmbed ? embeds.push(navEmbed) : embeds.push(ficheEmbed)
                } else if (Object.keys(characterFiches.result).length === 1) {
                    let ficheEmbed = characterFicheEmbedBuilder(characterFiches.result[0])
                    ficheEmbed ? embeds.push(ficheEmbed) : replyObj.content = "Le personnage ne possède pas de fiches"
                }
            } else {
                replyObj.content = "Le personnage ne possède pas de fiche";
            }
        }
    }

    // Action Row
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('characterFichePrev')
                .setLabel('⬅ Précédent')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('characterFicheNext')
                .setLabel('Suivant ➡')
                .setStyle(ButtonStyle.Primary),
        );

    // if (replyObj.content)
    replyObj.ephemeral = true
    if (embeds.length)
        replyObj.embeds = embeds
    replyObj.components = [row]
    // else if (!replyObj.content && !embeds.length)
    //     replyObj.content = "Une erreur est survenue"
    //     replyObj.ephemeral = true

    await interaction.reply(replyObj)
}
