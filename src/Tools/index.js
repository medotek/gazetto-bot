import {Cache} from "../Module/Cache.js";
import {GuildCommandProvider} from "../DataProvider/GuildCommandProvider.js";
import {config} from 'dotenv';
config();

export function accentsTidy(s) {
    var r = s.toLowerCase();
    r = r.replace(new RegExp("\\s", 'g'), "");
    r = r.replace(new RegExp("[àáâãäå]", 'g'), "a");
    r = r.replace(new RegExp("æ", 'g'), "ae");
    r = r.replace(new RegExp("ç", 'g'), "c");
    r = r.replace(new RegExp("[èéêë]", 'g'), "e");
    r = r.replace(new RegExp("[ìíîï]", 'g'), "i");
    r = r.replace(new RegExp("ñ", 'g'), "n");
    r = r.replace(new RegExp("[òóôõö]", 'g'), "o");
    r = r.replace(new RegExp("œ", 'g'), "oe");
    r = r.replace(new RegExp("[ùúûü]", 'g'), "u");
    r = r.replace(new RegExp("[ýÿ]", 'g'), "y");
    r = r.replace(new RegExp("\\W", 'g'), "");
    return r;
}

export async function mentionSlashCommand(commandName, guildId) {
    let commandId = await Cache.retrieve(`${commandName}_${guildId}`);

    // Caching guild command id
    if (!commandId) {
        let command = await GuildCommandProvider(commandName, guildId);

        (command && command.hasOwnProperty('commandId') && command.commandId) ?
            commandId = command.commandId
            : ''
    }

    return commandId ?
        `</${commandName}:${commandId}>`
        : `/${commandName}`
}

export const starRailResourceUrl = (endpoint) => {
    return process.env.STAR_RAIL_RES + endpoint
}

/**
 * game id enum
 */
export const Game = {
    Genshin: 'genshin',
    StarRail: 'star-rail'
}
