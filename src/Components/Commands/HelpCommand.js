import {EmbedBuilder} from "@discordjs/builders";
import {getCharacters} from "../../Request/Command/CharactersFiche.js";
import {Cache} from "../../Module/Cache.js";
import {helpCharactersListEmbedBuilder} from "../../Builder/Commands/HelpCharactersListEmbedBuilder.js";

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
                    "name": `🔹/set-uid`,
                    "value": `Enregistrer son UID`,
                    "inline": true
                },
                {
                    "name": `🔹/get-uid`,
                    "value": `Afficher un UID (le sien ou celui d'autrui)`,
                    "inline": true
                },
                {
                    "name": `📰/fiche`,
                    "value": `Recherche de fiche par personnage (et role)`
                }
            )
        )

        let ephemeral = true;
        if (interaction.channelId === "974701611995779123") {
            // ephemeral = false;
        }

        // each embed represent an element
        let cacheKey = 'charactersListHelpCommand'
        let charactersList = await Cache.retrieve(cacheKey)
        if (!charactersList) {
            let characters = await getCharacters()
            let charactersArr = []
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

            charactersArr.forEach(item => {
                let embed = helpCharactersListEmbedBuilder(item)
                if (embed) embeds.push(embed)
            })

            Cache.set(cacheKey, embeds)
        }

        interaction.reply({
            embeds: charactersList ?? embeds,
            ephemeral: ephemeral
        })
    }
}
