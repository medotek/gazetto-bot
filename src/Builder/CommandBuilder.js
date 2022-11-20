import {SlashCommandBuilder} from '@discordjs/builders'
import {Cache} from "../Module/Cache.js";

export const GetUidCommand = new SlashCommandBuilder()
    .setName('get-uid')
    .setDescription('Affiche les personnages vitrines de l\'utilisateur')
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription("Choissez l'utilisateur discord pour afficher son uid")
            .setRequired(true),
    );


export const SetUidCommand = new SlashCommandBuilder()
    .setName('set-uid')
    .setDescription('Enregistre ton uid');

/**
 * Create FicheCommand
 * @param characters
 * @param roles
 * @constructor
 */
export const FicheCommand = (characters, roles) => {
    if (typeof characters === "object" && Object.keys(characters).length) {
        /***************************/
        /****** MISE EN CACHE ******/
        /***************************/
        let cacheKey = 'ficheCharacters';
        let charactersArr = []
        for (const [key, character] of Object.entries(characters)) {
            if (typeof character.name !== 'undefined' && character.name) {
                let formattedCharacterName = character.name.toLowerCase();
                if (formattedCharacterName.match(/\S/g).length < 6) {
                    formattedCharacterName = formattedCharacterName.replace(/\s/g, "");
                }
                charactersArr.push({name: formattedCharacterName, id: character.id})
            }
        }

        Cache.set(cacheKey, charactersArr)


        return new SlashCommandBuilder()
            .setName('fiche')
            .setDescription('Effectue des recherches parmi les fiches de la Gazette (Armes et Personnages)')
            .addStringOption((option) => {
                    return option
                        .setName('personnage')
                        .setDescription("Recherche par personnage")
                        .setRequired(true)
                }
            )
            .addStringOption((option) => {
                    let customOption = option
                        .setName('role')
                        .setDescription("(facultatif) Filtrer par role");
                    // .setRequired(true);
                    for (const [key, role] of Object.entries(roles)) {
                        customOption.addChoices({name: role.name, value: `${role.name}`})
                    }

                    return customOption
                }
            )
    }

    return null;
}
