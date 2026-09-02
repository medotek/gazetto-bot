import {ActionRowBuilder, StringSelectMenuBuilder} from "discord.js";
import {AUTO_THEME, THEMES} from "../../../Builder/Commands/ProfileCardTheme.js";

/** Préfixe du customId, partagé par le composant et son handler. */
export const THEME_SELECT_ID = 'uid-card-theme'

/**
 * Le customId transporte tout ce dont le handler a besoin : le menu arrive
 * dans une interaction neuve, sans mémoire de la commande qui l'a produit.
 * L'auteur y figure pour que seul le demandeur puisse rhabiller sa carte.
 */
export const buildThemeSelectId = (uid, authorId) => `${THEME_SELECT_ID}_${uid}_${authorId}`

/**
 * @param customId issu de buildThemeSelectId
 * @returns {{uid: string, authorId: string}|null}
 */
export function parseThemeSelectId(customId) {
    const [prefix, uid, authorId] = customId.split('_')
    if (prefix !== THEME_SELECT_ID || !uid || !authorId) return null
    return {uid, authorId}
}

/**
 * Menu de choix d'habillage, affiché sous la carte de profil Genshin.
 *
 * @param uid          UID du profil affiché
 * @param authorId     auteur de la commande
 * @param currentTheme thème actuellement rendu, coché dans la liste
 * @returns {ActionRowBuilder}
 */
export function themeSelectComponent(uid, authorId, currentTheme = AUTO_THEME) {
    const menu = new StringSelectMenuBuilder()
        .setCustomId(buildThemeSelectId(uid, authorId))
        .setPlaceholder('Changer le thème de la carte')
        .addOptions(
            {
                label: 'Automatique',
                description: 'D\'après le premier personnage de la vitrine',
                value: AUTO_THEME,
                default: currentTheme === AUTO_THEME,
            },
            ...Object.entries(THEMES).map(([key, theme]) => ({
                label: theme.name,
                description: theme.region,
                value: key,
                default: currentTheme === key,
            })),
        )

    return new ActionRowBuilder().addComponents(menu)
}
