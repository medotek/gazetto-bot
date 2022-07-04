const findOption = require('../Utils/CommandHelper')
const userCrud = require('../../DataProvider/UserDataProvider')

module.exports = async (sequelize, commandName, interaction) => {
    /**
     * SET UID COMMAND
     */
    if (commandName === 'set-uid') {
        let ephemeralStatus = true
        let response = 'An error occurred, medo help!';
        let pseudo = findOption(interaction, 'pseudo');
        let uid = findOption(interaction, 'uid');
        const { user } = interaction
        if (pseudo.value && uid.value) {
            let existsResp = await userCrud('update', sequelize, user.id, uid.value, pseudo.value)

            // // Processing insertion in database
            // if (!existsResp) {
            //     console.log(insertDiscordUid(user.id, uid.value, pseudo.value))
            //     let insertionResp = await DbConnection.query(insertDiscordUid(user.id, uid.value, pseudo.value), function (err, result) {
            //         if (err) {
            //             console.log(err)
            //             return false
            //         } else {
            //             console.log(result)
            //             return result
            //         }
            //     });
            //
            //     if (insertionResp) {
            //         ephemeralStatus = true
            //         response = 'Created'
            //     }
            // } else {
            //     if (existsResp.status === 'error') {
            //         response = existsResp.detail
            //     } else {
            //         response = 'Informations mis à jour'
            //     }
            // }
        }

        await interaction.reply({content: response, ephemeral: true})
    }

    /**
     * GET UID COMMAND
     */
    if (commandName === 'get-uid') {

    }
}
