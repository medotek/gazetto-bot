import {Cache} from '../../Module/Cache.js'
import {CommandInteractionOptionResolver, EmbedBuilder} from 'discord.js'
import {getCharacterFiche} from "../../Request/Command/CharactersFiche.js";
import {characterFicheEmbedBuilder} from "../../Builder/Commands/EmbedBuilder.js";

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
            roles = JSON.stringify({'role' : role.value})
        }

        let characterFiches = await getCharacterFiche(character.value, roles)
        if (characterFiches && typeof role === "object" && characterFiches.hasOwnProperty('result')) {
            if (characterFiches.result && Object.keys(characterFiches.result).length) {
                // Multiple fiches
                if (Object.keys(characterFiches.result).length > 1) {
                    for (const [key, fiche] of Object.entries(characterFiches.result)) {
                        // TODO : I limited the number of embed of 10 in message
                        if (parseInt(key)+1 === 10) break;
                        let ficheEmbed = characterFicheEmbedBuilder(fiche, key)
                        ficheEmbed ? embeds.push(ficheEmbed) : ''
                    }
                } else if (Object.keys(characterFiches.result).length === 1) {
                    let ficheEmbed = characterFicheEmbedBuilder(characterFiches.result[0])
                    ficheEmbed ? embeds.push(ficheEmbed) : replyObj.content = "Le personnage ne possède pas de fiche"
                }
            } else {
                replyObj.content = "Le personnage ne possède pas de fiche";
            }
        }
    }
    if (replyObj.content)
        replyObj.ephemeral = true
    if (embeds.length)
        replyObj.embeds = embeds
    // else if (!replyObj.content && !embeds.length)
    //     replyObj.content = "Une erreur est survenue"
    //     replyObj.ephemeral = true

    await interaction.reply(replyObj)
}
