import { DataTypes } from "sequelize"

export const User = (sequelize) => {
    return sequelize.define("discord_uid", {
        userId: {
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: DataTypes.TEXT,
        uid: DataTypes.INTEGER
    }, {
        timestamps: false
    });
}
