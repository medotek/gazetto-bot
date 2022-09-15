import {EmbedBuilder} from "discord.js";
import {config} from 'dotenv'
import {formattedRoles, roleFieldBuilder} from "../../Components/Utils/CommandHelper.js";
config()

/**
 * @param characterFiche
 * @param iteration
 * @returns {EmbedBuilder}
 */
export const characterFicheEmbedBuilder = (characterFiche, iteration = null) => {
    const {genshinCharacter, image, roles} = characterFiche
    if (!genshinCharacter
        || typeof genshinCharacter !== "object"
        || !genshinCharacter.hasOwnProperty('imageIcon')
        || !genshinCharacter.hasOwnProperty('name')
        || !genshinCharacter.imageIcon
        || !genshinCharacter.name
        || !image) {
        return null;
    }

    let embedBuilder = new EmbedBuilder()
        // TODO : set default color per character
        .setTitle(genshinCharacter.name)
        .setURL(
            process.env.GAZETTE_CHARACTERS_BASE_URL
            + genshinCharacter.name
                .toLowerCase()
                .trim()
                .replaceAll(' ', '-')
            + (iteration ? '#'+iteration : '')
        )
        .setDescription(null)
        .setColor(0xf2d77c)
        .setThumbnail(genshinCharacter.imageIcon)
        .setImage(process.env.GUDASHBOARD_BASE_IMG_URL + image)

    // Format roles
    let fRoles = formattedRoles(roles)
    if (fRoles) {
        embedBuilder.addFields(roleFieldBuilder(fRoles, false))
    }

    return embedBuilder
}


