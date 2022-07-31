const findOption = require('../Utils/CommandHelper')
const UserDataProvider = require('../../DataProvider/UserDataProvider')

module.exports = async (sequelize, commandName, interaction) => {
    /**
     * SET UID COMMAND
     */
    let response = {
        message: 'An error occurred, medo help!'
    };

    if (commandName === 'set-uid') {
        let pseudo = findOption(interaction, 'pseudo');
        let uid = findOption(interaction, 'uid');
        const {user} = interaction
        if (pseudo.value && uid.value) {
            response = await UserDataProvider('update', sequelize, user, uid.value, pseudo.value)
        }

        await interaction.reply({content: response.message, ephemeral: true})
    }

    /**
     * GET UID COMMAND
     */
    if (commandName === 'get-uid') {
        let ephemeralStatus = true;
        let replyObject = {}
        let targetUser = interaction.options._hoistedOptions[0]
        response = await UserDataProvider('read', sequelize, targetUser.user)
        // Get data from database
        let embed = null;
        if (response.data) {
            // TODO : code ici pour afficher les embeds
            embed = {
                "title": "title ~~(did you know you can have markdown here too?)~~",
                "description": "this supports [named links](https://discordapp.com) on top of the previously shown subset of markdown. ```\nyes, even code blocks```",
                "url": "https://discordapp.com",
                "color": 1753330,
                "timestamp": "2022-06-20T21:15:43.123Z",
                "footer": {
                    "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
                    "text": "footer text"
                },
                "thumbnail": {
                    "url": "https://cdn.discordapp.com/embed/avatars/0.png"
                },
                "image": {
                    "url": "https://cdn.discordapp.com/embed/avatars/0.png"
                },
                "author": {
                    "name": "author name",
                    "url": "https://discordapp.com",
                    "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png"
                },
                "fields": [
                    {
                        "name": "🤔",
                        "value": "some of these properties have certain limits..."
                    }
                ]
            }
        }

        replyObject.message = response.message
        if (response.status !== 'error') ephemeralStatus = false;
        replyObject.ephemeral = ephemeralStatus
        if (embed) replyObject.embeds = [embed]
        await interaction.reply(replyObject)
    }
}
