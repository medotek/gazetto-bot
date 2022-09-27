import {Cache} from "../../../Module/Cache.js";
import {helpCharactersListEmbedBuilder} from "../../../Builder/Commands/HelpCharactersListEmbedBuilder.js";

export async function selectElementHelpCommandActions(interaction) {
    if (interaction.message.interaction.commandName !== 'kibo')
        return

    let interactionUpdate = {}
    let embeds = interaction.message.embeds;
    let newComponents = interaction.message.components

    if (interaction.user.id === interaction.message.interaction.user.id) {
        // Remove last embed - character element embed
        let cacheKey = 'charactersListHelpCommand'
        let charactersList = await Cache.retrieve(cacheKey)
        if (charactersList && typeof charactersList === "object" && Object.keys(charactersList).length) {
            if (interaction.values && interaction.values.length) {
                // approx 24 hours before disabling the action row - discord timestamp has a different timezone
                if (interaction.message.createdTimestamp + 5000 + 60 * 60 * 24  > Date.now()) {
                    embeds.pop()
                    let currentKey = parseInt(interaction.values[0])
                    embeds.push(helpCharactersListEmbedBuilder(charactersList[currentKey]))
                } else {
                    for (const [key, item] of Object.entries(interaction.message.components)) {
                        if (newComponents[key].components.length) {
                            newComponents[key].components.forEach((component, i) => {
                                console.log(component)
                                newComponents[key].components[i].data.disabled = true
                            })
                        }
                    }
                    interactionUpdate.components = newComponents
                }
            }
        }
    }

    interactionUpdate.embeds = embeds
    interaction.update(interactionUpdate)
}
