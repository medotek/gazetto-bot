import { DataTypes } from "sequelize"

export const User = (sequelize) => {
    return sequelize.define("discord_uid", {
        userId: {
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        uid: DataTypes.INTEGER,
        game: DataTypes.STRING,
    }, {
        timestamps: false
    });
}
