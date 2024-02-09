import {StringSelectMenuBuilder} from "discord.js";
import {rarityStar} from "../../Tools/index.js";

export function weaponsSelectComponent(weapons) {
    if (weapons && weapons.length) {
        /**
         * Weapons sheets
         */
        let selectMenuBuilder = new StringSelectMenuBuilder()
            .setCustomId('character-fiche-weapons')
            .setPlaceholder('Armes');

        // Order by rarity DESC
        weapons.sort(function (a, b) {
            if (a.rarity < b.rarity)
                return 1;
            else if (a.rarity > b.rarity)
                return -1;
            else
                // Si les raretés sont égales, trie par nom en ordre ascendant (ASC)
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            } else {
                return 0;
            }
        })

        weapons.forEach(weapon => {
            selectMenuBuilder.addOptions({
                label: `${weapon.rarity}${rarityStar(weapon.rarity)} - ${weapon.name}`,
                value: weapon.id.toString(),
            })
        })

        return selectMenuBuilder;
    }

    return null
}
