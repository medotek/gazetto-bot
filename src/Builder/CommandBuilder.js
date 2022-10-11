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
    .setDescription('Enregistre ton uid')
    .addIntegerOption((option) =>
        option
            .setName('uid')
            .setDescription('Donner l\'uid de l\'utilisateur genshin')
            .setRequired(true)
    )
    .addStringOption(
        (option) =>
            option
                .setName('pseudo')
                .setDescription('Votre pseudo sur Genshin')
                .setRequired(true)
    );

/**
 * Create FicheCommand
 * @param characters
 * @param roles
 * @constructor
 */
export const FicheCommand = (characters, roles) => {
    if (typeof characters === "object" && Object.keys(characters).length) {
        let cacheKey = 'ficheCharacters';
        let charactersArr = []
        for (const [key, character] of Object.entries(characters)) {
            charactersArr.push({name: character.name.toLowerCase().replace(/\s/g, ""), id: character.id})
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
