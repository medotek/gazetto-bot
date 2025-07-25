import {GudaToken} from "../../../Module/GudaToken.js";
import {artifactFicheEmbed, weaponFicheEmbed} from "../../../Builder/Commands/EmbedBuilder.js";
import {ActionRowBuilder, StringSelectMenuBuilder} from "discord.js";
import {rarityStar} from "../../../Tools/index.js";
import {request} from "undici";

export async function selectCharacterFicheArtifactSets(interaction) {
    if (interaction.customId !== 'character-fiche-artifacts')
        return;

    let artifactSetId = interaction.values[0]
    let gudaToken = await GudaToken.getBearerToken()
    let headers = {
        "Authorization": "Bearer " + gudaToken,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    let options = {
        method: 'GET',
        headers: headers
    }

    let {body} = await request(process.env.GUDASHBOARD_SWAGGER_URL + `artifact_sets/${artifactSetId}`, options)
    let artifactSetData = await body.json()
    let replyContent = {}

    if (artifactSetData.hasOwnProperty('characterFiches') && artifactSetData.characterFiches.length) {
        let charactersFromFiches = artifactSetData.characterFiches.filter(char => char.displayWeapons)
        // Set to store encountered values
        const seenValues = new Set();

        // Filter unique objects
        let characters = charactersFromFiches.filter(object => {
            // Convert object to string for comparison
            const objectString = JSON.stringify(object.genshinCharacter);

            // Check if object already exists in the set
            const isUnique = !seenValues.has(objectString);

            // If object is unique, add it to the set and return true
            if (isUnique) {
                seenValues.add(objectString);
            }

            return isUnique;
        });

        characters = characters.map(obj => {
            return obj.genshinCharacter
        })

        characters.sort(function (a, b) {
            if (a.rarity < b.rarity)
                return 1;
            else if (a.rarity > b.rarity)
                return -1;
            else
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                } else {
                    return 0;
                }
        })

        let selectBuilder = new StringSelectMenuBuilder()
            .setCustomId('weapon-fiche-characters')
            .setPlaceholder('Personnages conseillés');

        characters.forEach(character => {
            selectBuilder.addOptions({
                label: `${character.rarity}${rarityStar(character.rarity)} - ${character.name}`,
                value: character.id.toString(),
            })
        })

        replyContent.components = [new ActionRowBuilder().addComponents(selectBuilder)]

        replyContent.embeds = [artifactFicheEmbed(artifactSetData)]

        return interaction.reply(replyContent)
    }

    return interaction.reply({content: "Une erreur est survenue", ephemeral: true})
}
