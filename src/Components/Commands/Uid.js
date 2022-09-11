import {findOption} from '../Utils/CommandHelper.js'
import {UserDataProvider} from '../../DataProvider/UserDataProvider.js'
import {MessageEmbed} from 'discord.js'
import {Cache} from '../../Module/Cache.js'

export async function Uid(sequelize, commandName, interaction) {
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

        // Clear cache if exists
        let cacheKey = 'get-uid' + user.id
        if (Cache.has(cacheKey) && response.data) {
            Cache.clear(cacheKey)
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

        // Gestion du cache
        let cacheKey = 'get-uid' + targetUser.user.id;
        if (Cache.has(cacheKey)) {
            response = Cache.retrieve(cacheKey);
        } else {
            response = await UserDataProvider('read', sequelize, targetUser.user)
            if (response.data !== undefined && response.data.length)
                Cache.set(cacheKey, response.data)
        }

        // Get data from database
        let embed = null;
        if (response.data) {
            embed = new MessageEmbed()
                .setColor('f2d77c')
                .setDescription(`<:Primogemmes:913866333848997958> **Profil Genshin Impact de ${targetUser.user}** \n ㅤ`)
                .addFields(
                    {name: 'Pseudo', value: `${response.data.name}`, inline: true},
                    {name: 'UID', value: `${response.data.uid}`, inline: true},
                    {
                        name: 'Vitrine de personnages',
                        value: `[Voir sur enka.network](https://enka.network/u/${response.data.uid})`,
                        inline: false
                    },
                )
                .setThumbnail(targetUser.user.displayAvatarURL())
        }

        replyObject.message = response.message
        if (response.status !== 'error') ephemeralStatus = false;
        replyObject.ephemeral = ephemeralStatus
        if (embed) replyObject.embeds = [embed]
        await interaction.reply(replyObject)
    }
}
