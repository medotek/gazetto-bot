import {accentsTidy, filterArrayByPattern} from "../../Tools/index.js";
import gazetteDataProviderInstance from "../../DataProvider/Gazette.js";

export async function commandAutocomplete(interaction) {
    let options = []
    let characters = await gazetteDataProviderInstance.charactersSheets()
    let searchText = interaction.options.getString('personnage')
    if (searchText && characters.length) {
        searchText = accentsTidy(searchText, true)
        // return character name & value in an array
        let filter = filterArrayByPattern(characters
            .map(character => { return { name: character.name, value: character.id.toString() } }), searchText.split("\\s+").join("|"))

        // if the filter has less than 25 entries, the return (discord constraint)
        filter.length <= 25 ? options = filter : ''
    }

    interaction.respond(options);
}
