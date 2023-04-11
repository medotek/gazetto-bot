import {EmbedBuilder} from "discord.js";
import {config} from 'dotenv'
import {formattedRoles, roleFieldBuilder} from "../../Components/Utils/CommandHelper.js";
import {EnkaClient} from "enka-network-api";
import {createCanvas, loadImage, Image} from "canvas";
import {writeFileSync} from 'fs';

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
            + (iteration ? '#' + iteration : '')
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

/***
 * @param data
 * @param user
 * @returns {boolean|EmbedBuilder}
 */
export async function userUidEmbedBuilder(data, user) {
    if (typeof data !== "object" || typeof user !== "object") {
        return false
    }

    const enka = new EnkaClient()
    let enkaUser = await enka.fetchUser(data.uid)
    let embed = new EmbedBuilder()
        .setColor(0xf2d77c)
        .setTitle(`Profil Genshin Impact de ${user.username}`)
        .setDescription(`<:Primogemmes:913866333848997958> ${enkaUser.signature}`)
        .addFields(
            {name: 'Pseudo', value: enkaUser.nickname, inline: true},
            {name: 'UID', value: `${data.uid}`, inline: true},
            {name: '**-**', value: ' ', inline: false},
            {name: 'Niveau', value: `${enkaUser.level}`, inline: true},
            {name: 'Monde', value: `${enkaUser.worldLevel}`, inline: true},
            {name: '**-**', value: ' ', inline: false},
            {name: 'Personnages', value: ' ', inline: false},
        )
        .setURL(enkaUser.url)
        // user.displayAvatarURL
        .setThumbnail(enkaUser.profilePictureCharacter.icon.url)
        .setFooter({text: 'Powered by Enka.Network'})
    // .setImage()

    enkaUser.characters.forEach(function (character) {
        embed.addFields({
            name: character.characterData.name.get('fr'),
            value: `Lv.${character.level}, C${character.unlockedConstellations.length}`,
            inline: true
        })
    })

    // let characterPic = enkaUser.profileCard.pictures.filter(picture => picture.name === 'UI_NameCardPic_Tighnari_P')
    //
    // let rendering = await render(characterPic[0].url, data.uid, enkaUser.profilePictureCharacter.icon.url)
    // if (rendering)
    //     embed.setImage(`./assets/card/${data.uid}.png`)

    return embed
}



    return true;
}
