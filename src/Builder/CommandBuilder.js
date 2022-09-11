import {SlashCommandBuilder} from '@discordjs/builders'
import {getCharacters} from "../Request/Command/CharactersFiche.js";

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

export const FicheCommand = (characters, roles) => {
    if (characters.length) {
        return null
    }

    let commandSlash = new SlashCommandBuilder()
        .setName('fiche')
        .setDescription('Effectue des recherches parmi les fiches de la Gazette (Armes et Personnages)')
        .addStringOption((option) => {
                let customOption = option
                    .setName('personnage')
                    .setDescription("Recherche par personnage");
                for (const [key, character] of Object.entries(characters)) {
                    customOption.addChoices({name: character.name, value: `${character.id}`})
                }

                return customOption
            }
        )
        .addStringOption((option) => {
                let customOption = option
                    .setName('role')
                    .setDescription("Filtrer par role");

                for (const [key, role] of Object.entries(roles)) {
                    customOption.addChoices({name: role.name, value: `${role.id}`})
                }

                return customOption
            }
        );

    return commandSlash.toJSON()
}
