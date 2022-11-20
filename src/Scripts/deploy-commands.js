import {REST} from '@discordjs/rest'
import {Routes} from 'discord-api-types/v9'
import {config} from "dotenv";
import {GetUidCommand, SetUidCommand, FicheCommand} from "../Builder/CommandBuilder.js";
import {getCharacters, getRoles} from "../Request/Command/CharactersFiche.js";
import {GetUidFromUserMenuContextCommand, HelpCommand} from "../Components/Commands/MiscellaneousCommands.js";

config();

export async function deployCommands() {
    // Gudapi - Get characters from fiches
    let characters = await getCharacters()
    let roles = await getRoles()
    const commands = [
        GetUidCommand.toJSON(),
        SetUidCommand.toJSON(),
        // HelpCommand.toJSON(),
        // GetUidFromUserMenuContextCommand
    ];
    let ficheCommand = FicheCommand(characters, roles)
    ficheCommand ? commands.push(ficheCommand): console.log('Fiche command not available');
    const rest = new REST({version: '10'}).setToken(process.env.TOKEN);
    rest.put(
        Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),
        {body: commands}
    )
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}
