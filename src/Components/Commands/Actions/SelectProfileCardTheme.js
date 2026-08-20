import {AttachmentBuilder, EmbedBuilder, MessageFlags} from "discord.js";
import {buildProfileCard, CARD_FILE} from "../../../Builder/Commands/ProfileCardBuilder.js";
import {parseThemeSelectId, THEME_SELECT_ID, themeSelectComponent} from "../../../DTO/Commands/Uid/ThemeSelect.js";
import gameDataProviderInstance from "../../../DataProvider/Game.js";

/**
 * Rhabille la carte de profil quand le menu déroulant change de thème.
 *
 * Le message est public : seul l'auteur de la commande peut le modifier, sinon
 * n'importe qui pourrait changer la carte sous les yeux de celui qui la
 * consulte. Les autres reçoivent un refus visible d'eux seuls.
 */
export async function selectProfileCardTheme(interaction) {
    if (!interaction.customId?.startsWith(THEME_SELECT_ID)) return

    const context = parseThemeSelectId(interaction.customId)
    if (!context) return

    if (interaction.user.id !== context.authorId) {
        return interaction.reply({
            content: "Seule la personne qui a lancé la commande peut changer le thème de cette carte.",
            flags: MessageFlags.Ephemeral,
        })
    }

    const theme = interaction.values[0]

    // Le rendu dépasse parfois les trois secondes accordées à une réponse
    // directe : on accuse réception d'abord, on remplace ensuite.
    await interaction.deferUpdate()

    const enkaUser = await gameDataProviderInstance.genshinUser(context.uid)
    const png = enkaUser ? await buildProfileCard(enkaUser, context.uid, theme) : null

    if (!png) {
        return interaction.followUp({
            content: "Le thème n'a pas pu être appliqué, réessaie dans un instant.",
            flags: MessageFlags.Ephemeral,
        })
    }

    // `attachments: []` retire l'image précédente : sans ça Discord conserve
    // les deux et continue d'afficher l'ancienne.
    // `setImage(null)` garde l'embed au titre et au lien : la carte s'affiche
    // en pièce jointe libre, donc en pleine largeur.
    await interaction.editReply({
        embeds: interaction.message.embeds.map(embed => EmbedBuilder.from(embed).setImage(null)),
        files: [new AttachmentBuilder(png, {name: CARD_FILE})],
        attachments: [],
        components: [themeSelectComponent(context.uid, context.authorId, theme)],
    })
}
