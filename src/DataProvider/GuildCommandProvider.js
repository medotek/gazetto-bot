import {sequelize} from "../Services/DatabaseService.js";
import {GuildCommand} from "../Models/GuildCommand.js";
import {Cache} from "../Module/Cache.js";

export const GuildCommandProvider = async (commandName, guildId, commandId = null, applicationId = null) => {
    try {
        let model = null;
        /** CREATE **/
        if (commandId && applicationId) {

            let data = {
                guildId: guildId,
                commandId: commandId,
                applicationId: applicationId,
                name: commandName
            }

            const [guildCommand, created] = await GuildCommand(sequelize).findOrCreate({
                where: data,
                defaults: data
            })

            if (created) {
                Cache.set(`${commandName}_${guildId}`, commandId)
                model = guildCommand
            }

        } else {

            /** RETRIEVE **/
            let cachedGuildCommandId = await Cache.retrieve(`${commandName}_${guildId}`, commandId)
            let whereQuery = {}

            if (cachedGuildCommandId) {
                whereQuery.commandId = cachedGuildCommandId
            } else {
                whereQuery =  {guildId: guildId, name: commandName}
            }

            const guildCommand = await GuildCommand(sequelize).findOne({
                where: whereQuery,
            })

            if (guildCommand) {
                Cache.set(`${guildCommand.name}_${guildCommand.guildId}`, guildCommand.commandId)
                model = guildCommand
            }

        }

        return model
    } catch (e) {
        // TODO : logs
        console.error(e)
    }
}
