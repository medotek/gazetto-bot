const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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
