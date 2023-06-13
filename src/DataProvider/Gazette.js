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
}

let gazetteDataProviderInstance = new GazetteDataProvider();

export default gazetteDataProviderInstance;
