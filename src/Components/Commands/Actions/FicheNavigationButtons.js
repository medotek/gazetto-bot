import {ButtonBuilder, ButtonStyle, ComponentType} from "discord.js";

export function ficheNavigationButtons(interaction) {
    if (interaction.message.interaction.commandName !== 'fiche')
        return

    let newComponents = interaction.message.components;
    console.log(interaction.message.components)
    for (const [key, item] of Object.entries(interaction.message.components)) {
        // TODO if negation, disabled all CTA
        if (newComponents[key].components.length) {
            newComponents[key].components.forEach((component, i) => {
                newComponents[key].components[i].data.disabled = true
            })
        }

        if (item.data.type === ComponentType.ActionRow) {
        }
    }

    interaction.update({
        components: newComponents
    })
    // if (newRows.length)
    //     interaction.message.edit({
    //         components: newRows
    //     })
}
