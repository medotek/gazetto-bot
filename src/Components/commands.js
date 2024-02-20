import {GetUidFromUserMenuContext, Uid} from "./Commands/Uid.js";
import {InteractionType} from "discord-api-types/v10";
import {CharacterFiche} from "./Commands/CharacterFiche.js";
import {ficheNavigationButtons} from "./Commands/Actions/FicheNavigationButtons.js";
import {helpCommand} from "./Commands/HelpCommand.js";
import {selectElementHelpCommandActions} from "./Commands/Actions/SelectElementHelpCommandActions.js";
import {UidDTO} from "../DTO/Commands/Uid/UidDTO.js";
import {commandAutocomplete} from "../Handle/Interaction/Aucomplete.js";
import {selectCharacterFicheWeapons} from "./Commands/Actions/SelectCharacterFicheWeapons.js";
import {selectCharacterFromWeaponFiche} from "./Commands/Actions/SelectCharacterFromWeaponFiche.js";

export const Commands = (client, sequelize) => {
    client.on('interactionCreate', async interaction => {
        try {

            let response = {
                message: 'An error occurred, medo help!'
            };

            /***********************************/
            /*********** APP COMMAND ***********/
            /***********************************/
            if (interaction.type === InteractionType.ApplicationCommand) {
                const {commandName} = interaction;
                // Set/Get Uid Command
                await Uid(sequelize, commandName, interaction)
                // Fiche Command
                await CharacterFiche(commandName, interaction)
                // Help Command
                await helpCommand(interaction)
            } else

            /***********************************/
            /********* BUTTON ACTIONS **********/
            /***********************************/
            if (interaction.isButton()) {
                await ficheNavigationButtons(interaction)
            } else

            /***********************************/
            /********* SELECT ACTIONS **********/
            /***********************************/
            if (interaction.isStringSelectMenu()) {
                // Help Command
                await selectElementHelpCommandActions(interaction)
                // Character Fiche
                await selectCharacterFicheWeapons(interaction)
                // weapon Fiche
                await selectCharacterFromWeaponFiche(interaction)
            }

            /***********************************/
            /******** USER CONTEXT MENU ********/
            /***********************************/
            if (interaction.isUserContextMenuCommand()) {
                await GetUidFromUserMenuContext(interaction)
            } else

            /***********************************/
            /********* MODAL SUBMITTED *********/
            /***********************************/
            if (interaction.isModalSubmit()) {
                await UidDTO(interaction, response)
            }

            /***********************************/
            /*********** AUTOCOMPLETE **********/
            /***********************************/
            if (interaction.isAutocomplete()) {
                // TODO : default - get the most searched characters
                await commandAutocomplete(interaction)
            }
        } catch (e) {
            console.log(e)
        }
    })
}
