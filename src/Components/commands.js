const Uid = require('./Commands/Uid')

module.exports = (client, sequelize) => {
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        const {commandName, user} = interaction;
        // Set/Get Uid Command
        await Uid(sequelize, commandName, interaction, user)
    })
}
