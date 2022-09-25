import {EmbedBuilder} from "@discordjs/builders";

export function helpCharactersListEmbedBuilder(charactersByElement) {
    if (typeof charactersByElement === "object"
        && charactersByElement.element !== 'undefined'
        && charactersByElement.characters !== 'undefined'
    ) {
        const {name, icon, color} = charactersByElement.element
        if (!name || !icon ||!color) return null;
        let embed = new EmbedBuilder()
            .setColor(parseInt(color.replace('#', ''), 16))
            .setDescription(`Les personnages de type ${name}`)
            .setThumbnail(icon)

        for (const [key, character] of Object.entries(charactersByElement.characters)) {
            const {name, characterFiches} = character
            embed.addFields({
                name: name,
                value: `${characterFiches.length} fiche` + (characterFiches.length > 1 ? 's' : ''),
                inline: true
            })
        }

        return embed
    }

    return null
}
