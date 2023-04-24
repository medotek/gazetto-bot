import {EmbedBuilder} from "@discordjs/builders";
import {getCharacters} from "../../Request/Command/CharactersFiche.js";
import {Cache} from "../../Module/Cache.js";
import {helpCharactersListEmbedBuilder} from "../../Builder/Commands/HelpCharactersListEmbedBuilder.js";
import {ActionRowBuilder, StringSelectMenuBuilder} from "discord.js";
import {mentionSlashCommand} from "../../Tools/index.js";

export async function helpCommand(interaction) {
    const {commandName} = interaction
    let embeds = []
    // If not in chan, ephemeral as true
    if (commandName && commandName === "kibo") {
        embeds.push(new EmbedBuilder()
            .setTitle(`Liste des commandes <:Huhu:983796527799599164>`)
            .setDescription(`Tu trouveras les descriptions sur chaque commande`)
            .setColor(0xfff187)
            .addFields(
                {
                    "name": `🔹${await mentionSlashCommand("set-uid", interaction.guildId)}`,
                    "value": `Enregistrer son UID`,
                    "inline": true
                },
                {
                    "name": `🔹${await mentionSlashCommand("get-uid", interaction.guildId)}`,
                    "value": `Afficher un UID (le sien ou celui d'autrui)`,
                    "inline": true
                },
                {
                    "name": `📰${await mentionSlashCommand("fiche", interaction.guildId)}`,
                    "value": `Recherche de fiche par personnage (et role)`
                }
            )
        )

        let ephemeral = true;
        let channelsId = process.env.GUDA_FICHE_ALLOWED_CHANNELS_IDS
        let channels = null
        if (channelsId) {
            channels = channelsId.split(',')
            channels.forEach(channel => {
                if (channel === interaction.channelId) {
                    ephemeral = false;
                    return true;
                }
            })
        }

        let replyObj = {
            ephemeral: ephemeral
        }

        // each embed represent an element
        let cacheKey = 'charactersListHelpCommand'
        let charactersList = await Cache.retrieve(cacheKey)
        let charactersArr = []
        if (!charactersList) {
            let characters = await getCharacters()
            for (const [key, character] of Object.entries(characters)) {
                const {characterElement} = character
                let elementKey = charactersArr.findIndex(x => x.element.name === characterElement.name)
                if (elementKey === -1) {
                    charactersArr.push({
                        element: characterElement,
                        characters: [character]
                    })
                } else {
                    charactersArr[elementKey].characters.push(character)
                }
            }

            charactersList = charactersArr
            Cache.set(cacheKey, charactersList)
        }

        if (Object.keys(charactersList).length) {
            let embed = helpCharactersListEmbedBuilder(charactersList[0])
            if (embed) embeds.push(embed)

            // Add select menu action row
            let selectMenuBuilder = new StringSelectMenuBuilder()
                .setCustomId('select')
                .setPlaceholder('Choisissez un élément');

            charactersList.forEach((item, key) => {
                const {element} = item
                if (element && typeof element === "object" && element.hasOwnProperty('name')) {
                    selectMenuBuilder.addOptions({
                        label: `${element.name}`,
                        // because we remove the first el, the array has moved keys
                        value: `${key}`,
                    })
                }
            })

            const row = new ActionRowBuilder().addComponents(selectMenuBuilder);
            replyObj.components = [row]
        }

        replyObj.embeds = embeds
        interaction.reply(replyObj)
    }
}
