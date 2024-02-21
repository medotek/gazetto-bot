import {accentsTidy, filterArrayByPattern} from "../../Tools/index.js";
import gazetteDataProviderInstance from "../../DataProvider/Gazette.js";

export async function commandAutocomplete(interaction) {
    if (interaction.commandName !== 'fiche') return;
    let options = []
    let characters = await gazetteDataProviderInstance.charactersSheets()
    let searchText = interaction.options.getString('personnage')
    if (searchText && characters.length) {
        searchText = accentsTidy(searchText, true)
        // return character name & value in an array
        let filter = await gazetteDataProviderInstance.cachedSearchedKeyword(searchText, characters)
        // if the filter has less than 25 entries, then return (discord constraint)
        options = filter.slice(0, 24)
        return await interaction.respond(options);
    }

    // let filteredResults = randomlyFilter(characters)
    return await interaction.respond(characters.map(character => {
        return {
            name: character.name,
            value: character.id.toString()
        }
    }).reverse().slice(0, 24));
}

function randomlyFilter(array, numberOfResults = 25) {
    if (numberOfResults >= array.length) {
        return array;
    } else {
        const filteredResults = [];
        const usedIndices = new Set();

        while (filteredResults.length < numberOfResults) {
            const randomIndex = Math.floor(Math.random() * array.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                filteredResults.push({
                    name: array[randomIndex].name,
                    value: array[randomIndex].id.toString()
                });
            }
        }
        return filteredResults;
    }
}
