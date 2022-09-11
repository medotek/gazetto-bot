import {REST} from '@discordjs/rest'
import {Routes} from 'discord-api-types/v9'
import {config} from "dotenv";
import {InteractionType} from "discord-api-types/v10";
import {GudaToken} from "../Module/GudaToken.js";
import {GetUidCommand, SetUidCommand, FicheCommand} from "../Builder/CommandBuilder.js";
import {getCharacters} from "../Request/Command/CharactersFiche.js";

config();

// Gudapi - Get weapons from fiches

export async function deployCommands() {
    // Gudapi - Get characters from fiches
    let characters = await getCharacters()

    const commands = [
        GetUidCommand.toJSON(),
        SetUidCommand.toJSON(),
        FicheCommand(characters),
        {
            name: 'Test',
            type: InteractionType.ApplicationCommand
        }
    ];

    const rest = new REST({version: '10'}).setToken(process.env.TOKEN);

    rest.put(
        Routes.applicationGuildCommands(process.env.APP_ID, process.env.GUILD_ID),
        {body: commands}
    )
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}
