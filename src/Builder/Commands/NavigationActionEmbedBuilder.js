import {EmbedBuilder} from "discord.js";
import {Cache} from "../../Module/Cache.js";
import {formattedRoles, roleFieldBuilder} from "../../Components/Utils/CommandHelper.js";

/**
 * @param cacheKey
 * @param embed
 * @returns {Promise<void>}
 */
export async function navigationActionEmbedBuilder(cacheKey, embed) {
    let {data, current} = await Cache.retrieve(cacheKey)
    if (data && typeof current !== 'undefined') {
        let prev, next = ""
        let nextKey, prevKey = null;
        if (current) {
            if (Object.keys(data).length >= current + 1) {
                nextKey = current + 1
            } else {
                nextKey = 0
            }
            prevKey = current - 1;
        } else {
            // Last key
            prevKey = Object.keys(data).length - 1
            nextKey = current + 1;
        }
        let prevEl = data[prevKey]
        let nextEl = data[nextKey]
        if ((prevEl && prevEl.hasOwnProperty('roles'))
            && (nextEl && nextEl.hasOwnProperty('roles'))) {
            let prevRoles = formattedRoles(prevEl.roles)
            let nextRoles = formattedRoles(nextEl.roles)
            prev = roleFieldBuilder(prevRoles, true,"Fiche précédente")
            next = roleFieldBuilder(nextRoles, true, "Fiche suivante")
        }

        return embed
            .addFields(prev, next)
    }

    return null
}
