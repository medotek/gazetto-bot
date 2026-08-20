import {AttachmentBuilder, EmbedBuilder} from "discord.js";
import {config} from 'dotenv'
import {formattedRoles, roleFieldBuilder} from "../../Components/Utils/CommandHelper.js";
import {Game} from "../../Tools/index.js";
import gameDataProviderInstance from "../../DataProvider/Game.js";
import {buildProfileCard, CARD_FILE} from "./ProfileCardBuilder.js";

config({ quiet: true })

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

/**
 * Réponse de /get-uid pour Genshin : la carte de profil en image, portée par un
 * embed qui garde le lien Enka cliquable.
 *
 * Renvoie null si quoi que ce soit manque — l'appelant retombe alors sur
 * l'embed classique, pour qu'un souci de rendu ne prive pas le joueur de ses
 * informations.
 *
 * @param data ligne utilisateur (uid)
 * @param user utilisateur Discord ciblé
 * @returns {Promise<{embeds: EmbedBuilder[], files: AttachmentBuilder[]}|null>}
 */
export async function userUidCardBuilder(data, user) {
    if (typeof data !== "object" || typeof user !== "object") return null

    const enkaUser = await gameDataProviderInstance.genshinUser(data.uid)
    if (!enkaUser) return null

    const png = await buildProfileCard(enkaUser, data.uid)
    if (!png) return null

    // La carte reste une pièce jointe libre au lieu d'être posée dans l'embed :
    // Discord l'affiche alors en pleine largeur, là où une image d'embed est
    // réduite. L'embed ne porte plus que le titre et le lien Enka.
    const embed = new EmbedBuilder()
        .setColor(0xf2d77c)
        .setTitle("Profil Genshin Impact de " + user.username)
        .setURL(enkaUser.url)

    return {
        embeds: [embed],
        files: [new AttachmentBuilder(png, {name: CARD_FILE})],
    }
}

/***
 * @param data
 * @param user
 * @param game
 * @returns {boolean|EmbedBuilder}
 */
export async function userUidEmbedBuilder(data, user, game = Game.Genshin) {
    if (typeof data !== "object" || typeof user !== "object") {
        return false
    }

    let gameData;
    if (game === Game.Genshin) {
        gameData = await gameDataProviderInstance.genshinData(data.uid)
    } else {
        gameData = await gameDataProviderInstance.starRailData(data.uid)
    }

    if (!gameData) return false
    let description = (game === Game.Genshin ? "<:Primogemmes:913866333848997958> " : "") + gameData.signature;
    let embed = new EmbedBuilder()
        .setColor(0xf2d77c)
        .setTitle("Profil " + (game === Game.Genshin ? 'Genshin Impact' : 'Honkai Star Rail') + " de " + user.username)
        .addFields(
            {name: 'Pseudo', value: gameData.nickname, inline: true},
            {name: 'UID', value: "``" + data.uid + "``", inline: true},
            {name: '**-**', value: ' ', inline: false},
            {name: 'Niveau', value: `${gameData.level}`, inline: true},
            {name: (game === Game.Genshin ? 'Monde' : 'Equilibre'), value: `${gameData.worldLevel}`, inline: true},
            {name: '**-**', value: ' ', inline: false},
            {name: 'Personnages', value: ' ', inline: false},
        )
        .setURL(gameData.url)
        .setFooter({text: 'Powered by ' + (game === Game.Genshin ? 'Enka.Network' : 'Medo')})

    if (gameData.profilePictureCharacter)
        embed.setThumbnail(gameData.profilePictureCharacter)
    if (description)
        embed.setDescription(description)
    gameData.characters.forEach(function (character) {
        embed.addFields(character)
    })

    return embed
}

export const weaponFicheEmbed = (weaponData) => {
    let rarityColor = {
        '5': 0xffd966,
        '4': 0x8e7cc3,
        '3': 0x6fa8dc,
    }

    let embed = new EmbedBuilder()
        .setTitle(`[ARMES] ${weaponData.name}`)
        // TODO : ancrer vers les personnages
        .addFields(
            {name: "Type", value: weaponData.weaponType.name, inline: false},
            {name: 'Rareté', value: weaponData.rarity.toString(), inline: false}
        )
        .setImage(process.env.GUDASHBOARD_BASE_IMG_URL + weaponData.fiche)
        .setColor(rarityColor[weaponData.rarity.toString()])

    if (weaponData.image)
        embed.setThumbnail(weaponData.image)

    return embed;
}

export const artifactFicheEmbed = (artifactData) => {
    return new EmbedBuilder()
        .setTitle(`[ARTÉFACT] ${artifactData.name}`)
        // TODO : ancrer vers les personnages
        .addFields({name: "Set", value: artifactData.name, inline: false})
        .setThumbnail(process.env.GUDASHBOARD_BASE_IMG_URL + artifactData.image)
        .setImage(process.env.GUDASHBOARD_BASE_IMG_URL + artifactData.fiche)
        .setColor(0x49fb8)
}
