const {SlashCommandBuilder} = require('@discordjs/builders');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
require('dotenv').config()

const commands = [
    new SlashCommandBuilder().setName('get-uid').setDescription('Affiche les personnages vitrines de l\'utilisateur')
        .addUserOption((option) =>
            option.setName('user').setDescription("Choissez l'utilisateur discord pour afficher son uid").setRequired(true),
        ),
    new SlashCommandBuilder().setName('set-uid').setDescription('Enregistre ton uid')
        .addIntegerOption((option) =>
            option.setName('uid').setDescription('Donner l\'uid de l\'utilisateur genshin').setRequired(true)
        ).addStringOption((option) =>
            option.setName('pseudo').setDescription('Votre pseudo sur Genshin').setRequired(true)
        ),
    new SlashCommandBuilder().setName('test').setDescription('Gazetto répond par oui ou non'),
    new SlashCommandBuilder().setName('boop')
        .setDescription('Boops the specified user, as many times as you want')
        .addUserOption((option) => option.setName('user').setDescription('The user to boop').setRequired(true))

        // Adds an integer option
        .addIntegerOption((option) =>
            option.setName('boop_amount').setDescription('How many times should the user be booped (defaults to 1)'),
        )

        // Supports choices too!
        .addIntegerOption((option) =>
            option
                .setName('boop_reminder')
                .setDescription('How often should we remind you to boop the user')
                .addChoices({name: 'Every day', value: 1}, {name: 'Weekly', value: 7}),
        )
]
.
map(command => command.toJSON());

const rest = new REST({version: '9'}).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands('934804517512425492', '902963233571352606'), {body: commands})
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);

