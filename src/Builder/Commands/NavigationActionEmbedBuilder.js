import {EmbedBuilder} from "discord.js";
import {Cache} from "../../Module/Cache.js";
import {formattedRoles, roleFieldBuilder} from "../../Components/Utils/CommandHelper.js";
import {getNextAndPrevFichesFromTheCurrentOne} from "../../DTO/Commands/FicheNavigationDTO.js";

/**
 * @param cacheKey
 * @param embed
 * @param hasTwoObjs
 * @returns {Promise<void>}
 */
export async function navigationActionEmbedBuilder(cacheKey, embed, hasTwoObjs = null) {
    let {data, current} = await Cache.retrieve(cacheKey)
    if (data && typeof current !== 'undefined') {
        let prev, next = null
        const {prevEl, nextEl} = getNextAndPrevFichesFromTheCurrentOne(data, current)
        if ((prevEl.data && prevEl.data.hasOwnProperty('roles'))
            && (nextEl.data && nextEl.data.hasOwnProperty('roles'))) {
            let prevRoles = formattedRoles(prevEl.data.roles)
            let nextRoles = formattedRoles(nextEl.data.roles)
            prev = roleFieldBuilder(prevRoles, true, "Fiche précédente")
            next = roleFieldBuilder(nextRoles, true, "Fiche suivante")
        }

        switch (hasTwoObjs) {
            case 'next':
                return embed.addFields(next)
            case 'prev':
                return embed.addFields(prev)
            default:
                return embed.addFields(prev, next)
        }
    }

    return null
}
