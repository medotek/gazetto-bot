import { DataTypes } from "sequelize"

export const User = (sequelize) => {
    return sequelize.define("discord_uid", {
        userId: {
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        uid: {
            type: DataTypes.INTEGER
        },
        game: {
            type: DataTypes.STRING,
            primaryKey: true,
        }
    }, {
        timestamps: false
    });
}
