
import {findCharacterFiche} from "../CharacterFiche.js";

export async function selectCharacterFromWeaponFiche(interaction) {
    if (interaction.customId !== 'weapon-fiche-characters')
        return;

    let characterId = interaction.values[0]
    let replyContent = await findCharacterFiche(interaction, [{id: parseInt(characterId)}])

    return interaction.reply(replyContent)
}
