import {Cache} from "../../../Module/Cache.js";
import {UserProvider} from "../../../DataProvider/UserProvider.js";
import {sequelize} from "../../../Services/DatabaseService.js";

export async function getUserUidData(cacheKey, targetUser) {
    let response = {}
    if (Cache.has(cacheKey) && await Cache.retrieve(cacheKey) !== null) {
        response.data = await Cache.retrieve(cacheKey);
    } else {
        response = await UserProvider('read', sequelize, targetUser)
        if (typeof response.data === "object"
            && response.data !== undefined
            && Object.keys(response.data).length) {
            Cache.set(cacheKey, response.data)
        }
    }

    return response
}
