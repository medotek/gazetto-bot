/**
 * Thèmes de la carte de profil.
 *
 * Les palettes ne sont pas inventées : ce sont les variables Elementor des
 * modes du site (body.medo-mode, body.fina-mode, ...), avec la correspondance
 *   text -> ink | 1eae59e -> surface | primary -> accent | a43188d -> gold
 * Kibo n'a pas de mode dédié et garde les couleurs standards de la Gazette,
 * extraites du logo.
 *
 * `gold` porte les chiffres (rang, UID, étoiles, signature) : c'est de
 * l'information, pas de la décoration. Les dorés de Kibo et Fina ont donc été
 * assombris depuis leur valeur du site, qui tombait sous 4.5:1 sur le papier
 * clair — respectivement 3.46:1 et 2.85:1.
 *
 * `veil` est la couleur de fond du thème (d7a44f0). Elle sert de voile radial
 * sur les bannières claires, où le texte manquait d'assise. Les bannières
 * sombres n'en ont pas besoin : `veil: null` les laisse intactes.
 */
export const THEMES = {
    kibo: {
        name: 'Classique', region: 'Mondstadt', dark: false,
        ink: '#16303a', surface: '#fefff0', accent: '#3597a6', gold: '#8f7024', veil: '#eef6f7',
    },
    fina: {
        name: 'Narukami', region: 'Inazuma', dark: false,
        ink: '#1e2230', surface: '#ffffff', accent: '#a74d6a', gold: '#926d17', veil: '#f6eaed',
    },
    aste: {
        name: 'Varanara', region: 'Sumeru', dark: false,
        ink: '#1e2230', surface: '#ffffff', accent: '#754087', gold: '#7c513f', veil: '#f1e9f3',
    },
    medo: {
        name: 'Sanctifeu', region: 'Natlan', dark: true,
        ink: '#f5f5f5', surface: '#1e1d2e', accent: '#fdddb7', gold: '#e9cc70', veil: null,
    },
    yung: {
        name: 'Stormterror', region: 'Fontaine', dark: true,
        ink: '#f5f5f5', surface: '#242b3d', accent: '#d1fbee', gold: '#80bda9', veil: null,
    },
}

/** Valeur de l'option quand le joueur laisse la vitrine décider. */
export const AUTO_THEME = 'auto'

/**
 * Choix de l'option Discord, dérivés de THEMES pour qu'ajouter un thème ne
 * demande pas de penser à mettre la commande à jour.
 * @returns {{name: string, value: string}[]}
 */
export function themeChoices() {
    return [
        {name: 'Automatique (selon la vitrine)', value: AUTO_THEME},
        ...Object.entries(THEMES).map(([key, t]) => ({
            name: t.name,
            value: key,
        })),
    ]
}

/**
 * Région du personnage -> thème. `avatarAssocType` vit dans les données brutes
 * du jeu (details._data), l'API typée d'enka ne l'expose pas.
 * Les régions sans thème dédié (Mondstadt, Liyue, Nod-Krai, Fatui, Snezhnaya,
 * le Voyageur...) retombent sur Kibo.
 */
const REGION_THEME = {
    ASSOC_TYPE_INAZUMA: 'fina',
    ASSOC_TYPE_SUMERU: 'aste',
    ASSOC_TYPE_FONTAINE: 'yung',
    ASSOC_TYPE_NATLAN: 'medo',
}

export const DEFAULT_THEME = 'kibo'

/**
 * Choisit le thème d'après le premier personnage de la vitrine.
 * @param {Array} characters vitrine enka (peut être vide)
 * @returns {string} clé de THEMES
 */
export function themeForRoster(characters) {
    const first = characters?.[0]
    if (!first) return DEFAULT_THEME
    const assoc = first.characterData?.details?._data?.avatarAssocType
    return REGION_THEME[assoc] ?? DEFAULT_THEME
}

/**
 * Couleurs d'élément. `bar` teinte le filet de vignette (posé sur un fond
 * translucide), `ink` le numéro de constellation — la version vive ne passerait
 * pas sur le papier clair, d'où les deux valeurs.
 */
export const ELEMENTS = {
    Pyro: {bar: '#ef7938', ink: '#c1531b'},
    Hydro: {bar: '#4cc2f1', ink: '#1d7fa8'},
    Anemo: {bar: '#74c2a8', ink: '#3d8d73'},
    Geo: {bar: '#fab72e', ink: '#a87a09'},
    Dendro: {bar: '#a5c83b', ink: '#68821c'},
    Electro: {bar: '#af8ec1', ink: '#6d4a85'},
    Cryo: {bar: '#9fd6e3', ink: '#3d8496'},
    none: {bar: '#b9c4c6', ink: '#5d7075'},
}
