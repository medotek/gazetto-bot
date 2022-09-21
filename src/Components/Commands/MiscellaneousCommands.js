import {SlashCommandBuilder} from "@discordjs/builders";
import {InteractionType} from "discord-api-types/v10";

export const HelpCommand = new SlashCommandBuilder()
    .setName('kibo')
    .setDescription('Pour vous aider à mieux comprendre Kibo (commandes et leur fonctionnement)')

export const GetUidFromUserMenuContextCommand =
    {
        name: 'UID',
        type: InteractionType.ApplicationCommand
    }
