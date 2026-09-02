import {createCanvas, loadImage, GlobalFonts} from '@napi-rs/canvas'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {existsSync} from 'node:fs'
import {Cache} from '../../Module/Cache.js'
import {THEMES, ELEMENTS, themeForRoster} from './ProfileCardTheme.js'

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '../../Assets')

/** Nom de la pièce jointe, partagé par la commande et le changement de thème. */
export const CARD_FILE = 'profil-genshin.png'

/* ------------------------------------------------------------------ polices */

// Les polices du site. Sans elles canvas retombe sur une police système et le
// rendu s'écarte des maquettes, donc on les embarque dans le dépôt.
const FONTS = [
    ['Poppins-SemiBold.ttf', 'GzPoppins'],
    ['Roboto-Regular.ttf', 'GzRoboto'],
    ['Roboto-Italic.ttf', 'GzRobotoItalic'],
    ['RobotoMono-Medium.ttf', 'GzMono'],
]
let fontsReady = false
function registerFonts() {
    if (fontsReady) return
    for (const [file, family] of FONTS) {
        const path = join(ASSETS, 'fonts', file)
        if (existsSync(path)) GlobalFonts.registerFromPath(path, family)
        else console.warn(`[carte] police absente : ${file}`)
    }
    fontsReady = true
}

/* ------------------------------------------------------------- géométrie */

// La carte reprend le ratio natif des bannières (2560x1362) : rien n'est rogné.
const W = 1200
const H = 638
// Les maquettes sont exprimées en cqw, 100cqw valant la largeur de la carte.
const U = W / 100

const PAD_X = 2 * U
const PAD_Y = 1.8 * U
const COL_LEFT_RATIO = 0.265
const MAX_ROSTER = 12      // la vitrine du jeu plafonne à 12
const ROSTER_COLS = 4

/* ------------------------------------------------------------- utilitaires */

const hexToRgba = (hex, alpha) => {
    const n = parseInt(hex.slice(1), 16)
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

const font = (family, size) => `${size}px "${family}"`

/** Tronque au ratio réel mesuré, ellipse comprise. */
function fitText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text
    let cut = text
    while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1)
    return `${cut}…`
}

/**
 * « Kaedehara Kazuha » ne rentre pas dans une vignette et se tronquerait en
 * « Kaedehara… », le moins reconnaissable des deux mots. Au-delà de douze
 * caractères on garde le dernier mot ; « Hu Tao » reste entier.
 */
const shortName = name => (name.length > 12 && name.includes(' ') ? name.split(' ').pop() : name)

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
}

/** Dessine une image recadrée en cercle (avatars, vignettes). */
function circleImage(ctx, img, cx, cy, radius) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.clip()
    // `cover` : on prend le plus petit côté comme référence
    const scale = Math.max((radius * 2) / img.width, (radius * 2) / img.height)
    const w = img.width * scale
    const h = img.height * scale
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h)
    ctx.restore()
}

/** Image contenue dans une boîte, sans déformation ni débordement. */
function containImage(ctx, img, x, y, boxW, boxH) {
    const scale = Math.min(boxW / img.width, boxH / img.height)
    const w = img.width * scale
    const h = img.height * scale
    ctx.drawImage(img, x + (boxW - w) / 2, y + (boxH - h) / 2, w, h)
}

/* ------------------------------------------------------------------ assets */

/**
 * Les fichiers du dépôt ne changent jamais : on les garde en mémoire pour de
 * bon. Les icônes de personnages viennent d'enka et passent par le cache
 * applicatif, avec un TTL long — ce sont des textures de jeu, elles ne bougent
 * qu'aux mises à jour.
 */
const localAssets = new Map()
async function localAsset(relPath) {
    if (localAssets.has(relPath)) return localAssets.get(relPath)
    const img = await loadImage(join(ASSETS, relPath))
    localAssets.set(relPath, img)
    return img
}

const REMOTE_TTL = 24 * 60 * 60

/**
 * Charge une image distante. Renvoie null plutôt que de propager : une icône
 * manquante doit laisser un trou dans une vignette, pas faire échouer la carte.
 */
async function remoteImage(url) {
    if (!url) return null
    const key = `cardimg_${url}`
    const cached = await Cache.retrieve(key)
    if (cached) return cached
    try {
        const res = await fetch(url, {headers: {'User-Agent': 'gazetto-bot'}})
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const img = await loadImage(Buffer.from(await res.arrayBuffer()))
        Cache.set(key, img, REMOTE_TTL)
        return img
    } catch {
        return null
    }
}

/**
 * La première source d'enka est un miroir régulièrement indisponible ;
 * `nextSource()` donne les suivantes. On ne signale qu'un échec complet :
 * basculer de miroir est le fonctionnement normal, pas un incident.
 */
async function imageWithFallback(assets) {
    let current = assets
    for (let i = 0; i < 4 && current; i++) {
        const img = await remoteImage(current.url)
        if (img) return img
        current = current.nextSource?.() ?? null
    }
    if (assets?.url) console.warn(`[carte] aucune source disponible pour ${assets.name ?? assets.url}`)
    return null
}

/* -------------------------------------------------------------- primitives */

/** Texte en capitales espacées, pour les intitulés. */
function drawLabel(ctx, text, x, y, {size, color, spacing = 0.14, family = 'GzRoboto', align = 'left'}) {
    ctx.save()
    ctx.font = font(family, size)
    ctx.fillStyle = color
    ctx.textAlign = align
    ctx.textBaseline = 'alphabetic'
    ctx.letterSpacing = `${size * spacing}px`
    ctx.fillText(text.toUpperCase(), x, y)
    ctx.restore()
}

/** Cartouche translucide : le « papier » posé sur le paysage. */
function drawSheet(ctx, x, y, w, h, palette, radius = 0.45 * U) {
    ctx.save()
    roundRect(ctx, x, y, w, h, radius)
    ctx.fillStyle = palette.sheet
    ctx.fill()
    ctx.lineWidth = Math.max(1, 0.08 * U)
    ctx.strokeStyle = palette.edge
    ctx.stroke()
    ctx.restore()
}

/* ----------------------------------------------------------------- palette */

function buildPalette(theme) {
    const t = THEMES[theme]
    return {
        ...t,
        inkSoft: hexToRgba(t.ink, t.dark ? 0.68 : 0.62),
        sheet: hexToRgba(t.surface, t.dark ? 0.62 : 0.88),
        sheetSolid: hexToRgba(t.surface, t.dark ? 0.8 : 0.95),
        edge: hexToRgba(t.accent, t.dark ? 0.42 : 0.4),
    }
}

/* -------------------------------------------------------------- les blocs */

function drawBackground(ctx, bg, palette) {
    ctx.drawImage(bg, 0, 0, W, H)
    if (!palette.veil) return
    // Voile dense au centre, nul aux angles : le texte gagne son fond, le
    // décor des bannières (torii, totems, lotus) reste visible.
    const g = ctx.createRadialGradient(W / 2, H * 0.44, 0, W / 2, H * 0.44, W * 0.62)
    g.addColorStop(0, hexToRgba(palette.veil, 0.88))
    g.addColorStop(0.46, hexToRgba(palette.veil, 0.72))
    g.addColorStop(0.74, hexToRgba(palette.veil, 0.28))
    g.addColorStop(1, hexToRgba(palette.veil, 0))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
}

function drawMasthead(ctx, logo, uid, palette) {
    const size = 3.4 * U
    const top = PAD_Y
    containImage(ctx, logo, PAD_X, top, size, size)

    const titleSize = 1.95 * U
    ctx.save()
    ctx.font = font('GzPoppins', titleSize)
    ctx.fillStyle = palette.ink
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = `${titleSize * 0.15}px`
    ctx.fillText('LA GAZETTE DE TEYVAT', PAD_X + size + 1.1 * U, top + size / 2)
    ctx.restore()

    // UID aligné à droite, présenté comme le numéro d'une édition
    const uidPretty = String(uid).replace(/(\d{3})(?=\d)/g, '$1 ')
    drawLabel(ctx, 'UID', W - PAD_X, top + size * 0.36, {
        size: 0.86 * U, color: palette.inkSoft, spacing: 0.18, align: 'right',
    })
    ctx.save()
    ctx.font = font('GzMono', 1.1 * U)
    ctx.fillStyle = palette.gold
    ctx.textAlign = 'right'
    ctx.letterSpacing = `${1.1 * U * 0.1}px`
    ctx.fillText(uidPretty, W - PAD_X, top + size * 0.92)
    ctx.restore()

    const ruleY = top + size + 0.75 * U
    ctx.save()
    ctx.strokeStyle = palette.edge
    ctx.lineWidth = Math.max(1, 0.13 * U)
    ctx.beginPath()
    ctx.moveTo(PAD_X, ruleY)
    ctx.lineTo(W - PAD_X, ruleY)
    ctx.stroke()
    ctx.restore()
    return ruleY
}

async function drawLeftColumn(ctx, data, palette, theme, box) {
    const {x, y, w, bottom} = box
    let cursor = y

    // --- identité : avatar + pseudo + signature
    const avatar = 5.6 * U
    const pfp = data.profilePicture ? await imageWithFallback(data.profilePicture.icon) : null
    if (pfp) circleImage(ctx, pfp, x + avatar / 2, cursor + avatar / 2, avatar / 2)
    else {
        ctx.save()
        ctx.beginPath()
        ctx.arc(x + avatar / 2, cursor + avatar / 2, avatar / 2, 0, Math.PI * 2)
        ctx.fillStyle = palette.sheetSolid
        ctx.fill()
        ctx.restore()
    }
    ctx.save()
    ctx.beginPath()
    ctx.arc(x + avatar / 2, cursor + avatar / 2, avatar / 2, 0, Math.PI * 2)
    ctx.strokeStyle = palette.gold
    ctx.lineWidth = 0.22 * U
    ctx.stroke()
    ctx.restore()

    const textX = x + avatar + 1 * U
    const textW = w - avatar - 1 * U
    ctx.save()
    ctx.font = font('GzPoppins', 2.3 * U)
    ctx.fillStyle = palette.accent
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(fitText(ctx, data.nickname ?? 'Voyageur', textW), textX, cursor + avatar * 0.46)
    ctx.restore()

    if (data.signature) {
        ctx.save()
        ctx.font = font('GzRobotoItalic', 1.05 * U)
        ctx.fillStyle = palette.inkSoft
        ctx.fillText(fitText(ctx, `« ${data.signature} »`, textW), textX, cursor + avatar * 0.78)
        ctx.restore()
    }
    cursor += avatar + 0.9 * U

    // --- rang d'aventure et niveau de monde
    const pillH = 3.9 * U
    const pillW = (w - 0.6 * U) / 2
    const pills = [[data.level, "Rang d'aventure"], [data.worldLevel, 'Niveau de monde']]
    pills.forEach(([value, caption], i) => {
        const px = x + i * (pillW + 0.6 * U)
        drawSheet(ctx, px, cursor, pillW, pillH, palette)
        ctx.save()
        ctx.font = font('GzPoppins', 1.6 * U)
        ctx.fillStyle = palette.gold
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(String(value), px + 0.6 * U, cursor + 1.9 * U)
        ctx.restore()
        drawLabel(ctx, caption, px + 0.6 * U, cursor + 3.1 * U, {
            size: 0.78 * U, color: palette.inkSoft, spacing: 0.12,
        })
    })
    cursor += pillH + 0.9 * U

    // --- brèves : seulement ce que le profil expose réellement.
    // Un Abysse à zéro étoile n'est pas une information, il est masqué comme
    // un Théâtre absent.
    const briefs = []
    const abyss = data.spiralAbyss
    if (abyss && abyss.stars > 0) briefs.push(['Abysse', `${abyss.floor}-${abyss.chamber} ★${abyss.stars}`])
    if (data.theater) briefs.push(['Théâtre', `Acte ${data.theater.act} ★${data.theater.stars}`])
    if (data.achievements) briefs.push(['Succès', String(data.achievements)])
    if (data.maxFriendshipCount) briefs.push(['Amitié 10', String(data.maxFriendshipCount)])

    // Les brèves s'ancrent au bas de la colonne, juste au-dessus de la
    // signature : elles suivent le bord de la carte plutôt que de laisser un
    // trou quand le profil en expose peu.
    const briefH = 2.5 * U
    const shown = briefs.slice(0, 4)
    const bylineTop = bottom - 5.6 * U
    const briefsH = shown.length * briefH + Math.max(0, shown.length - 1) * 0.45 * U
    cursor = Math.max(cursor, bylineTop - 0.9 * U - briefsH)

    for (const [caption, value] of shown) {
        drawSheet(ctx, x, cursor, w, briefH, palette, 0.18 * U)
        // liseré doré à gauche, comme un filet de brève
        ctx.save()
        roundRect(ctx, x, cursor, 0.24 * U, briefH, 0.12 * U)
        ctx.fillStyle = palette.gold
        ctx.fill()
        ctx.restore()

        drawLabel(ctx, caption, x + 0.7 * U, cursor + briefH * 0.66, {
            size: 0.82 * U, color: palette.inkSoft, spacing: 0.13,
        })
        ctx.save()
        ctx.font = font('GzMono', 1.05 * U)
        ctx.fillStyle = palette.ink
        ctx.textAlign = 'right'
        ctx.fillText(value, x + w - 0.6 * U, cursor + briefH * 0.68)
        ctx.restore()
        cursor += briefH + 0.45 * U
    }

    // --- signature du rédacteur, ancrée en bas comme l'ours d'un journal
    const bylineH = 5.6 * U
    const by = bottom - bylineH
    drawSheet(ctx, x, by, w, bylineH, palette)
    const member = await localAsset(`themes/member-${theme}.webp`)
    // Boîte contrainte sur les deux axes : le timbre est en portrait, la
    // mascotte Kibo en paysage. Sans ça Kibo écrase les autres.
    containImage(ctx, member, x + 0.7 * U, by + 0.5 * U, 4.4 * U, 4.6 * U)
    const infoX = x + 0.7 * U + 4.4 * U + 0.7 * U
    drawLabel(ctx, 'Édition', infoX, by + 2.3 * U, {
        size: 0.75 * U, color: palette.inkSoft, spacing: 0.16,
    })
    ctx.save()
    ctx.font = font('GzPoppins', 1.3 * U)
    ctx.fillStyle = palette.gold
    ctx.fillText(THEMES[theme].name, infoX, by + 4 * U)
    ctx.restore()
}

async function drawRoster(ctx, characters, palette, box) {
    const {x, y, w, bottom} = box

    // Le compteur n'apparaît que s'il compte quelque chose : « La vitrine · 0 »
    // ne dit rien que la ligne en dessous ne dise déjà.
    const heading = characters.length ? `La vitrine · ${characters.length}` : 'La vitrine'
    drawLabel(ctx, heading, x, y + 1 * U, {
        size: 1 * U, color: palette.gold, spacing: 0.28, family: 'GzPoppins',
    })
    // filet dégradé qui prolonge l'intitulé
    const labelW = 9 * U
    const g = ctx.createLinearGradient(x + labelW, 0, x + w, 0)
    g.addColorStop(0, palette.edge)
    g.addColorStop(1, hexToRgba(THEMES.kibo.surface, 0))
    ctx.save()
    ctx.fillStyle = g
    ctx.fillRect(x + labelW, y + 0.7 * U, w - labelW, Math.max(1, 0.08 * U))
    ctx.restore()

    let cursor = y + 1.8 * U

    if (!characters.length) {
        ctx.save()
        ctx.font = font('GzRobotoItalic', 1.1 * U)
        ctx.fillStyle = palette.inkSoft
        ctx.fillText('Aucun personnage en vitrine', x, cursor + 2 * U)
        ctx.restore()
        return
    }

    const gap = 0.7 * U
    const cellW = (w - gap * (ROSTER_COLS - 1)) / ROSTER_COLS

    // La grille occupe la hauteur disponible : trois rangées de douze
    // personnages remplissent la carte, une seule rangée ne produit pas des
    // vignettes démesurées grâce au plafond.
    const shown = characters.slice(0, MAX_ROSTER)
    const rows = Math.ceil(shown.length / ROSTER_COLS)
    const cellH = Math.min(12.4 * U, (bottom - cursor - gap * (rows - 1)) / rows)

    for (const [i, character] of shown.entries()) {
        const cx = x + (i % ROSTER_COLS) * (cellW + gap)
        const cy = cursor + Math.floor(i / ROSTER_COLS) * (cellH + gap)
        if (cy + cellH > bottom) break

        const cd = character.characterData
        const element = ELEMENTS[cd.element?.name?.get('en')] ?? ELEMENTS.none

        drawSheet(ctx, cx, cy, cellW, cellH, palette, 0.5 * U)
        // filet d'élément en tête de vignette, rogné au rayon du cartouche
        ctx.save()
        roundRect(ctx, cx, cy, cellW, cellH, 0.5 * U)
        ctx.clip()
        ctx.fillStyle = element.bar
        ctx.fillRect(cx, cy, cellW, 0.22 * U)
        ctx.restore()

        // Le contenu de la vignette suit la hauteur de cellule plutôt que des
        // décalages fixes, sinon il se décolle dès que la grille change.
        const icon = await imageWithFallback(cd.icon)
        const iconSize = Math.min(cellW - 1.4 * U, cellH * 0.46)
        if (icon) circleImage(ctx, icon, cx + cellW / 2, cy + cellH * 0.08 + iconSize / 2, iconSize / 2)

        ctx.save()
        ctx.textAlign = 'center'
        ctx.font = font('GzRoboto', 0.92 * U)
        ctx.fillStyle = palette.ink
        const name = shortName(cd.name.get('fr') ?? cd.name.get('en') ?? '?')
        ctx.fillText(fitText(ctx, name, cellW - 0.6 * U), cx + cellW / 2, cy + cellH * 0.68)

        ctx.font = font('GzMono', 0.82 * U)
        const level = `Lv.${character.level} `
        const cons = `C${character.unlockedConstellations.length}`
        const totalW = ctx.measureText(level + cons).width
        ctx.textAlign = 'left'
        ctx.fillStyle = palette.inkSoft
        ctx.fillText(level, cx + cellW / 2 - totalW / 2, cy + cellH * 0.88)
        ctx.fillStyle = palette.dark ? element.bar : element.ink
        ctx.fillText(cons, cx + cellW / 2 - totalW / 2 + ctx.measureText(level).width, cy + cellH * 0.88)
        ctx.restore()
    }
}

function drawSignatureLine(ctx, palette, x, y) {
    // Halo de la couleur de surface : décolle le texte du décor du fond sans
    // poser un cartouche de plus en bas de carte.
    ctx.save()
    ctx.shadowColor = palette.sheetSolid
    ctx.shadowBlur = 0.6 * U
    ctx.font = font('GzRoboto', 0.82 * U)
    ctx.fillStyle = palette.inkSoft
    ctx.letterSpacing = `${0.82 * U * 0.06}px`
    const prefix = 'Cooked by '
    ctx.fillText(prefix, x, y)
    const prefixW = ctx.measureText(prefix).width
    ctx.font = font('GzPoppins', 0.82 * U)
    ctx.fillStyle = palette.gold
    ctx.fillText('Kibo', x + prefixW, y)
    const kiboW = ctx.measureText('Kibo').width
    ctx.font = font('GzRoboto', 0.82 * U)
    ctx.fillStyle = palette.inkSoft
    ctx.fillText(' · données enka.network', x + prefixW + kiboW, y)
    ctx.restore()
}

/* ------------------------------------------------------------------ public */

/**
 * Rend la carte de profil d'un joueur Genshin.
 *
 * @param {object} enkaUser DetailedGenshinUser renvoyé par EnkaClient.fetchUser
 * @param {number|string} uid affiché en manchette
 * @param {string} [themeOverride] force un thème au lieu de le déduire de la vitrine
 * @returns {Promise<Buffer|null>} PNG, ou null si le rendu a échoué
 */
export async function buildProfileCard(enkaUser, uid, themeOverride = null) {
    if (!enkaUser) return null
    try {
        registerFonts()

        const characters = enkaUser.characters ?? []
        const theme = THEMES[themeOverride] ? themeOverride : themeForRoster(characters)
        const palette = buildPalette(theme)

        const canvas = createCanvas(W, H)
        const ctx = canvas.getContext('2d')

        drawBackground(ctx, await localAsset(`themes/${theme}.webp`), palette)

        // L'easter egg passe avant le contenu : s'il devait un jour croiser une
        // vignette, c'est la vignette qui gagne.
        if (theme === 'medo') {
            const dog = await localAsset('themes/easter-medo.svg')
            const dogW = 6.6 * U
            ctx.drawImage(dog, W - 2.4 * U - dogW, H - 1 * U - dogW * (150 / 130), dogW, dogW * (150 / 130))
        }

        const ruleY = drawMasthead(ctx, await localAsset('themes/logo.webp'), uid, palette)

        const bodyTop = ruleY + 1.3 * U
        const bodyBottom = H - PAD_Y
        const innerW = W - PAD_X * 2
        const leftW = innerW * COL_LEFT_RATIO - 1.5 * U

        await drawLeftColumn(ctx, enkaUser, palette, theme, {
            x: PAD_X, y: bodyTop, w: leftW, bottom: bodyBottom,
        })

        // séparateur entre les deux colonnes
        const dividerX = PAD_X + innerW * COL_LEFT_RATIO
        ctx.save()
        ctx.strokeStyle = palette.edge
        ctx.lineWidth = Math.max(1, 0.1 * U)
        ctx.beginPath()
        ctx.moveTo(dividerX, bodyTop)
        ctx.lineTo(dividerX, bodyBottom)
        ctx.stroke()
        ctx.restore()

        const rightX = dividerX + 1.6 * U
        const rightW = W - PAD_X - rightX
        await drawRoster(ctx, characters, palette, {
            x: rightX, y: bodyTop, w: rightW, bottom: bodyBottom - 2.4 * U,
        })
        drawSignatureLine(ctx, palette, rightX, bodyBottom - 0.4 * U)

        return await canvas.encode('png')
    } catch (e) {
        console.error('[carte] rendu impossible :', e)
        return null
    }
}
