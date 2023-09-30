import {EnkaClient} from "enka-network-api";
import {config} from 'dotenv';
import {request} from "undici";
import {starRailResourceUrl} from "../Tools/index.js";

config();

let instance;

class GameDataProvider {
    constructor() {
        if (instance) {
            throw new Error("New instance cannot be created!!");
        }

        instance = this;
    }

    async genshinData(uid) {
        try {
            const enka = new EnkaClient()
            let enkaUser = await enka.fetchUser(uid)
            if (!enkaUser) return null

            return {
                nickname: enkaUser.nickname,
                level: enkaUser.level,
                worldLevel: enkaUser.worldLevel,
                signature: enkaUser.signature,
                url: enkaUser.url,
                profilePictureCharacter: enkaUser.profilePictureCharacter?.icon?.url,
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
                    url: "https://rails-express.com/u/" + uid,
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
