import {EmbedBuilder} from "discord.js";
import {config} from 'dotenv'
config()

/**
 * @param characterFiche
 * @returns {EmbedBuilder}
 */
export const characterFicheEmbedBuilder = (characterFiche) => {
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
        .setDescription(null)
        .setColor(0xf2d77c)
        .setThumbnail(genshinCharacter.imageIcon)
        .setImage(process.env.GUDASHBOARD_BASE_IMG_URL + image)

    // Format roles
    let rolesArray = [];
    if (roles && Array.isArray(roles) && roles.length) {
        roles.forEach(role => {
            if (typeof role === "object" && role.hasOwnProperty("name") && role.name)
                rolesArray.push(role.name)
        })
    }

    let formattedRoles = rolesArray.length ? rolesArray.join(', ') : ''
    if (formattedRoles) {
        embedBuilder.addFields(roleFieldBuilder(formattedRoles))
    }

    return embedBuilder
}

function roleFieldBuilder(value) {
    return {
        "name": `Role(s)`,
        "value": value,
        "inline": true
    }
}
