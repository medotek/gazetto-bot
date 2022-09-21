import {config} from  'dotenv'
import {Sequelize} from "sequelize";
// Init dotenv config
config()

export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PWD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    dialectOptions: {
        connectTimeout:100000
    }
});
