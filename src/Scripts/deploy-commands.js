import {REST} from '@discordjs/rest'
import {Routes} from 'discord-api-types/v9'
import {config} from "dotenv";
import {FicheCommand, GetUidCommand, SetUidCommand} from "../Builder/CommandBuilder.js";
import {getCharacters, getRoles} from "../Request/Command/CharactersFiche.js";
import {GetUidFromUserMenuContextCommand, HelpCommand} from "../Components/Commands/MiscellaneousCommands.js";
import {GuildCommandProvider} from "../DataProvider/GuildCommandProvider.js";

config();

export async function deployCommands() {
    // Gudapi - Get characters from fiches
    let characters = await getCharacters()
    let roles = await getRoles()
    const commands = [
        GetUidCommand.toJSON(),
        SetUidCommand.toJSON(),
        HelpCommand.toJSON(),
        GetUidFromUserMenuContextCommand
    ];
    let ficheCommand = FicheCommand(characters, roles)
    ficheCommand ? commands.push(ficheCommand) : console.error('Fiche command not available');
    const rest = new REST({version: '10'}).setToken(process.env.TOKEN);
    rest.put(
        Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),
        {body: commands}
    )
        .then((e) => cachingCommandId(e)
        )
        .catch(console.error);
}

/**
 * Caching command id
 * @param {array} commands
 */
async function cachingCommandId(commands) {
    if (typeof commands !== 'object' || !Array.isArray(commands) || !commands.length) return console.error(commands)

    for (const command of commands) {
        try {
            if (command.name === 'fiche'
                || command.name === 'get-uid'
                || command.name === 'set-uid'
            ) {
                await GuildCommandProvider(command.name, command.guild_id, command.id, command.application_id)
            }
        } catch (e) {
            // TODO : log
            console.log(e)
        }
    }
}
