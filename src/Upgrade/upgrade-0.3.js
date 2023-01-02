import Upgrade from "../Module/Upgrade.cjs";
import {sequelize} from "../Services/DatabaseService.js";

try {
    if (Upgrade(0.3)) {
        await sequelize.query("CREATE TABLE IF NOT EXISTS `server_commands` (`guild_id` bigint NOT NULL,`command_name` varchar(30) NOT NULL,`allowed_channels` text NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8;")
        await sequelize.query("ALTER TABLE `server_commands` ADD KEY `find_allowed_channels` (`guild_id`,`command_name`);")
        await sequelize.query("ALTER TABLE `server_commands` ADD UNIQUE `server_command` (`guild_id`, `command_name`) USING BTREE;")
        console.log("L'upgrade s'est bien déroulé")
    } else {
        console.log("> L'upgrade a échoué")
    }

} catch (err) {
    console.log("> L'upgrade a échoué")
}

console.log("==================================================================")
