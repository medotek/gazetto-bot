import {accentsTidy, filterArrayByPattern} from "../../Tools/index.js";
import gazetteDataProviderInstance from "../../DataProvider/Gazette.js";

export async function commandAutocomplete(interaction) {
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
}
