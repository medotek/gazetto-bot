import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType} from "discord.js";
import {Cache} from "../../../Module/Cache.js";
import {getNextAndPrevFichesFromTheCurrentOne} from "../../../DTO/Commands/FicheNavigationDTO.js";
import {characterFicheEmbedBuilder} from "../../../Builder/Commands/EmbedBuilder.js";
import {navigationActionEmbedBuilder} from "../../../Builder/Commands/NavigationActionEmbedBuilder.js";

export async function ficheNavigationButtons(interaction) {
    if (interaction.message.interaction.commandName !== 'fiche'
        || typeof interaction.customId === 'undefined')
        return


    let interactionUpdate = {}
    let newComponents = interaction.message.components;
    // Prev or Next
    let customIdArray = interaction.customId.split('_')
    let navAction = customIdArray[0]
    let originalInteractionId = customIdArray[1]
    let row;
    let navigationForTwoObjs = null;
    let hasNavigationForTwoObjs = false;
    // Restrict to the author of the command only
    if (interaction.user.id === interaction.message.interaction.user.id) {
        let hasError = false
        let cacheKey = 'userId' + interaction.user.id + 'interactionId' + originalInteractionId
        try {
            let {data, current} = await Cache.retrieve(cacheKey)
            if (data && typeof current !== 'undefined') {
                const {prevEl, nextEl} = getNextAndPrevFichesFromTheCurrentOne(data, current)
                let newEmbed = null
                let newCurrentKey = null
                switch (navAction) {
                    case 'characterFicheNext':
                        if (nextEl && nextEl.hasOwnProperty('data') && nextEl.hasOwnProperty('key')) {
                            newEmbed = characterFicheEmbedBuilder(nextEl.data)
                            // Update current key in cache
                            newCurrentKey = nextEl.key
                        }
                        row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('characterFichePrev_' + originalInteractionId)
                                    .setLabel('⬅ Précédent')
                                    .setStyle(ButtonStyle.Primary),
                            );
                        navigationForTwoObjs = 'prev'
                        break;
                    case 'characterFichePrev':
                        if (prevEl && prevEl.hasOwnProperty('data') && prevEl.hasOwnProperty('key')) {
                            newEmbed = characterFicheEmbedBuilder(prevEl.data)
                            // Update current key in cache
                            newCurrentKey = prevEl.key
                        }
                        row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('characterFicheNext_' + originalInteractionId)
                                    .setLabel('Suivant ➡')
                                    .setStyle(ButtonStyle.Primary),
                            );
                        navigationForTwoObjs = 'next'
                        break;
                    default:
                        hasError = true;
                }

                if (typeof newCurrentKey === "number")
                    Cache.set(cacheKey, {data, current: newCurrentKey})
                if (newEmbed) {
                    let navigationForTwoObjsEmbed = null
                    if (Object.keys(data).length === 2 && navigationForTwoObjs) {
                        hasNavigationForTwoObjs = true
                        navigationForTwoObjsEmbed = navigationForTwoObjs
                    }
                    interactionUpdate.embeds = [await navigationActionEmbedBuilder(cacheKey, newEmbed, navigationForTwoObjsEmbed)]
                }
            } else {
                hasError = true
            }
        } catch (e) {
            // CacheId doesn't exists
            console.log(e)
            hasError = true
        }

        if (hasError) {
            // Has error = disabled all buttons
            for (const [key, item] of Object.entries(interaction.message.components)) {
                if (newComponents[key].components.length) {
                    newComponents[key].components.forEach((component, i) => {
                        newComponents[key].components[i].data.disabled = true
                        newComponents[key].components[i].data.style = ButtonStyle.Secondary
                    })
                }

                // TODO check this line
                if (item.data.type === ComponentType.ActionRow) {
                }
            }
        } else if (row && hasNavigationForTwoObjs) {
            newComponents = [row]
        }
    }

    interactionUpdate.components = newComponents
    interaction.update(interactionUpdate)
}
