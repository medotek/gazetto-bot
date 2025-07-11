import {config} from 'dotenv';
import {accentsTidy, filterArrayByPattern} from "../Tools/index.js";
import {Cache} from "../Module/Cache.js";
import {getArtifacts, getCharacters} from "../Request/Command/CharactersFiche.js";

config();

let instance;

class GazetteDataProvider {
    constructor() {
        if (instance) {
            throw new Error("New instance cannot be created!!");
        }

        instance = this;
    }

    async charactersSheets(formatted = false) {
        /*********************************/
        /********* MISE EN CACHE *********/
        /*********************************/
        let cacheKey = 'charactersSheets_' + formatted;

        if (!Cache.has(cacheKey)) {
            let characters = await getCharacters()
            let charactersArr = []
            for (const [key, character] of Object.entries(characters)) {
                if (typeof character.name === 'undefined' || !character.name) {
                    continue
                }

                let formattedCharacterName = accentsTidy(character.name, formatted)
                charactersArr.push({name: formattedCharacterName, id: character.id})
            }

            Cache.set(cacheKey, charactersArr)
        }

        return await Cache.retrieve(cacheKey)
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
            // filter data
            cachedSearchKeyword[keyword] = filterArrayByPattern(data
                .map(character => {
                    return {name: character.name, value: character.id.toString()}
                }), keyword.split("\\s+").join("|"))
            // Cache the updated searchedKeyword
            Cache.set(cacheKey, cachedSearchKeyword)
        }

        // return accessible key value
        return cachedSearchKeyword[keyword]
    }
}

let gazetteDataProviderInstance = new GazetteDataProvider();

export default gazetteDataProviderInstance;
