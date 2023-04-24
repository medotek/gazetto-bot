import {DataTypes} from "sequelize"

export const GuildCommand = (sequelize) => {
    return sequelize.define("guild_commands", {
        guildId: DataTypes.BIGINT,
        commandId: DataTypes.BIGINT,
        name: DataTypes.STRING,
        applicationId: DataTypes.BIGINT
    }, {
        indexes: [
            {
                unique: true,
                fields: ['guildId', 'commandId', 'applicationId']
            }
        ],
        timestamps: false
    });
}
