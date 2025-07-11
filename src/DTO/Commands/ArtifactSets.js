import {StringSelectMenuBuilder} from "discord.js";

export function artifactSetSelectComponent(artifacts) {
    if (artifacts && artifacts.length) {
        /**
         * ArtifactSet sheets
         */
        let selectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId('character-fiche-artifacts')
            .setPlaceholder('Set d\'Artéfacts');

        artifacts.forEach(set => {
            selectMenuBuilder.addOptions({
                label: set.name,
                value: set.id.toString(),
            })
        })

        return selectMenuBuilder;
    }

    return null
}
