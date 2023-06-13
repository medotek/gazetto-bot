import {SlashCommandBuilder} from '@discordjs/builders'
import {Cache} from "../Module/Cache.js";
import {accentsTidy, Game} from "../Tools/index.js";

export const GetUidCommand = new SlashCommandBuilder()
    .setName('get-uid')
    .setDescription('Affiche les personnages vitrines de l\'utilisateur')
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription("Choissez l'utilisateur discord pour afficher son uid")
            .setRequired(true),
    )
    .addStringOption(option =>
        option.setName("game")
            .setDescription('Choisissez le jeux')
            .setRequired(true)
            .addChoices(
                {name: 'Genshin', value: Game.Genshin},
                {name: 'Honkai Star Rail', value: Game.StarRail}
            )
    );


export const SetUidCommand = new SlashCommandBuilder()
    .setName('set-uid')
    .setDescription('Enregistre ton uid')
    .addStringOption(option =>
        option.setName("game")
            .setDescription('Choisissez le jeux')
            .setRequired(true)
            .addChoices(
                {name: 'Genshin', value: 'genshin'},
                {name: 'Honkai Star Rail', value: 'star-rail'}
            )
    );

/**
 * Create FicheCommand
 * @param roles
 */
export const FicheCommand = (roles) => {
    return new SlashCommandBuilder()
        .setName('fiche')
        .setDescription('Effectue des recherches parmi les fiches de la Gazette (Armes et Personnages)')
        .addStringOption((option) => {
                return option
                    .setName('personnage')
                    .setDescription("Recherche par personnage")
                    .setRequired(true)
                    .setAutocomplete(true)
            }
        )
        .addStringOption((option) => {
                let customOption = option
                    .setName('role')
                    .setDescription("(facultatif) Filtrer par role");
                for (const [key, role] of Object.entries(roles)) {
                    customOption.addChoices({name: role.name, value: `${role.name}`})
                }

                return customOption
            }
        )
}
