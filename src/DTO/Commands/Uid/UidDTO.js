import UserDataProvider from "../../../DataProvider/User.js";

export async function UidDTO(interaction, response) {
    // array : commandName_game
    let array = interaction.customId.split('_')
    let game = array[1] ?? null
    let commandName = array[0] ?? null

    if (game && commandName === `setUidModal`) {
        const {user} = interaction
        const uid = interaction.fields.getTextInputValue('setUidNumber')
        let userData = new UserDataProvider(user)
        if (uid) response = await userData.setGameUid(uid, game)
    }

    await interaction.reply({content: response.message ?? response.content, ephemeral: true})
}
