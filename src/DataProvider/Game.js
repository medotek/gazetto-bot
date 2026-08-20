import {config} from 'dotenv';
import {request} from "undici";
import {starRailResourceUrl} from "../Tools/index.js";
import {genshinClient} from "../index.js";
import {Cache} from "../Module/Cache.js";

config({ quiet: true });

let instance;

class GameDataProvider {
    constructor() {
        if (instance) {
            throw new Error("New instance cannot be created!!");
        }

        instance = this;
    }

    /**
     * Profil enka brut, pour ce qui a besoin de plus que les champs remontés
     * par genshinData : la carte de profil lit la vitrine, les talents et les
     * régions des personnages.
     *
     * @param uid
     * @returns {Promise<object|null>}
     */
    async genshinUser(uid) {
        // Court TTL : assez pour que changer d'habillage de carte reparte du
        // profil déjà chargé au lieu de rappeler Enka, sans figer les données
        // d'un joueur qui vient de modifier sa vitrine.
        const cacheKey = `enka_user_${uid}`
        const cached = await Cache.retrieve(cacheKey)
        if (cached) return cached

        try {
            const user = await genshinClient.fetchUser(uid)
            if (user) Cache.set(cacheKey, user, 5 * 60)
            return user
        } catch (e) {
            console.error(e)
            return null
        }
    }

    async genshinData(uid) {
        try {
            let enkaUser = await genshinClient.fetchUser(uid)
            if (!enkaUser) return null

            return {
                nickname: enkaUser.nickname,
                level: enkaUser.level,
                worldLevel: enkaUser.worldLevel,
                signature: enkaUser.signature,
                url: enkaUser.url,
                profilePictureCharacter: enkaUser.profilePicture?.icon?.url,
                characters: enkaUser.characters.map(character => {
                        return {
                            name: character.characterData.name.get('fr'),
                            value: `Lv.${character.level}, C${character.unlockedConstellations.length}`,
                            inline: true
                        }
                    }
                ),
            }
        } catch (e) {
            console.error(e)
        }

        return false;
    }

    async starRailData(uid) {
        try {
            let requestUrl = new URL(process.env.STAR_RAIL_API + uid)
            requestUrl.searchParams.set('version', 'v2')
            requestUrl.searchParams.set('lang', 'fr')
            let starRailUser = await request(requestUrl.href)
            let response = await starRailUser.body.json()
            if (response && response.hasOwnProperty('player') && response.hasOwnProperty('characters')) {
                return {
                    nickname: response.player.nickname,
                    level: response.player.level,
                    worldLevel: response.player.world_level,
                    signature: response.player.signature,
                    url: "https://enka.network/hsr/" + uid,
                    profilePictureCharacter: starRailResourceUrl(response.player.avatar.icon),
                    characters: response.characters.map(character => {
                            return {
                                name: character.name,
                                value: `Lv.${character.level}, E${character.rank}`,
                                inline: true
                            }
                        }
                    ),
                }
            }
        } catch (e) {
            console.log(e)
        }

        return false;
    }
}

let gameDataProviderInstance = new GameDataProvider();

export default gameDataProviderInstance;
