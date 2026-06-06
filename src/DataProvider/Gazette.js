import {config} from 'dotenv';
import {accentsTidy} from "../Tools/index.js";
import {Cache} from "../Module/Cache.js";
import {getCharacters} from "../Request/Command/CharactersFiche.js";

config();

let instance;

class GazetteDataProvider {
    constructor() {
        if (instance) {
            throw new Error("New instance cannot be created!!");
        }

        instance = this;
    }

    async charactersSheets(formatted = false, forceRefresh = false) {
        /*********************************/
        /********* MISE EN CACHE *********/
        /*********************************/
        let cacheKey = 'charactersSheets_' + formatted;

        if (forceRefresh || !Cache.has(cacheKey)) {
            let characters = await getCharacters()
            let charactersArr = []
            if (characters && typeof characters === 'object') {
                for (const [key, character] of Object.entries(characters)) {
                    if (typeof character.name === 'undefined' || !character.name) {
                        continue
                    }

                    let formattedCharacterName = accentsTidy(character.name, formatted)
                    charactersArr.push({name: formattedCharacterName, id: character.id})
                }
            }

            // Cache without expiry (0) so a user interaction never has to wait on
            // the API: the data is kept warm by a background refresh instead.
            // Only overwrite on a successful, non-empty fetch so a failed refresh
            // keeps serving the last good data.
            if (charactersArr.length) {
                Cache.set(cacheKey, charactersArr, 0)
                // Drop memoized search results so refreshed data is searchable now.
                Cache.clear('searchedKeyword')
                return charactersArr
            }

            return await Cache.retrieve(cacheKey) || charactersArr
        }

        return await Cache.retrieve(cacheKey) || []
    }

    async cachedSearchedKeyword(keyword, data) {
        let cacheKey = 'searchedKeyword'
        let cachedSearchKeyword;

        if (Cache.has(cacheKey)) {
            cachedSearchKeyword = await Cache.retrieve(cacheKey)
        } else {
            cachedSearchKeyword = []
        }

        // verify if the keyword is cached
        if (typeof cachedSearchKeyword[keyword] === 'undefined') {
            // Match on a fully normalized name (lowercased, accents and spaces
            // stripped) so the search stays space-insensitive on both sides.
            // The keyword arrives already normalized via accentsTidy(_, true),
            // e.g. "hu tao" -> "hutao" must still match the name "Hu Tao".
            cachedSearchKeyword[keyword] = data
                .filter(character => accentsTidy(character.name, true).includes(keyword))
                .map(character => {
                    return {name: character.name, value: character.id.toString()}
                })
            // Cache the updated searchedKeyword
            Cache.set(cacheKey, cachedSearchKeyword)
        }

        // return accessible key value
        return cachedSearchKeyword[keyword]
    }
}

let gazetteDataProviderInstance = new GazetteDataProvider();

export default gazetteDataProviderInstance;
