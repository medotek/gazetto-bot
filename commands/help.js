const discord = require('discord.js')
const pagination = require('discord.js-pagination');

//Modèle
module.exports = {
    name: 'help',
    description: 'help pages',
    execute(client, message, args, Discord){
        const page1 = new discord.MessageEmbed()
        .setTitle("🔎 Voici comment trouver votre bonheur :")
        .setDescription("*Les commandes sont composées du préfixe ``!GT`` suivi du nom exact ou de mots clés (fr/eng) de l'élément recherché.*\n\n__Exemples__ :\n``!GTalbedo`` (fiche d'Albedo)\n``!GTamos`` (fiche de l'arc d'Amos)\n``!GTjournalier`` (guide journalier)")
        .setColor("#3595A6")
        .addField("Liste complète des __personnages__ disponibles :", "``!GTpersonnages``", true)
        .addField("Liste complète des __armes__ disponibles :", "``!GT1main``\n``!GT2mains``\n``!GThast``\n``!GTcatalyseurs``\n``!GTarcs``", true)
        .addField("Liste complète des __guides__ disponibles :", "``!GTguides``", true)

        const page2 = new discord.MessageEmbed()
        .setTitle("🔎 Liste complète des __personnages__ disponibles :")
        .setColor("#3595A6")
        .addField("PYRO","Amber\nBennett\nDiluc\nHu Tao\nKlee\nThomas\nXiangling\nXinyan\nYanfei\nYoimiya", true)
        .addField("HYDRO", "Barbara\nMona\nSangonomiya Kokomi\nTartaglia\nXingqiu", true)
        .addField("ANEMO", "Jean\nKaedehara Kazuha\nSayu\nSucrose\nVenti\nXiao", true)
        .addField("ELECTRO", "Beidou\nFischl\nKeqing\nKujou Sara\nLisa\nRazor\nShogun Raiden\nYae Miko", true)
        .addField("CRYO", "Aloy\nChongyun\nDiona\nEula\nGanyu\nKaeya\nAyaka\nQiqi\nRosalia\nShenhe", true)
        .addField("GEO", "Albedo\nArataki Itto\nGorou\nNingguang\nNoëlle\nYun Jin\nZhongli", true)

        const page3 = new discord.MessageEmbed()
        .setTitle("🔎 Liste complète des __épées 1 main__ disponibles :")
        .setColor("#3595A6")
        .addField("★★★★★","Coupeur de jade primordial\nLame de la Voûte d'Azur\nLune ondulante de Futsu\nReflet de tranche-brume", true)
        .addField("★★★★","Épée de Favonius\nÉpée rituelle\nFlûte\nLame kageuchi d'Amenoma\nRugissement du Lion", true)
        .addField("★★★","Messager de l'Aube", true)


        const pages = [
            page1,
            page2,
            page3,
        ]
        const emoji = ["◀️","▶️"]
        pagination (message, pages, emoji)
    }
}