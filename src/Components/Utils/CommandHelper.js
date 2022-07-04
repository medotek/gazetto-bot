module.exports = (interaction, name) => {
    return interaction.options._hoistedOptions.find(element => element.name === name)
}
