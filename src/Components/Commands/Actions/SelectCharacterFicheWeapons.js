import {Cache} from "../../../Module/Cache.js";
import {GudaToken} from "../../../Module/GudaToken.js";
import {weaponFicheEmbed} from "../../../Builder/Commands/EmbedBuilder.js";

export async function selectCharacterFicheWeapons(interaction) {
    if (interaction.customId !== 'character-fiche-weapons')
        return;

    let weaponId = interaction.values[0]
    let gudaToken = await GudaToken.getBearerToken()
    let headers = {
        "Authorization": "Bearer " + gudaToken,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    let options = {
        method: 'GET',
        headers: headers
    }
    let weaponResponse = await fetch(process.env.GUDASHBOARD_SWAGGER_URL + `weapons/${weaponId}`, options)
    return interaction.reply({
        embeds: [weaponFicheEmbed(await weaponResponse.json())]
    })
}
