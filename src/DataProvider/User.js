import {User} from '../Models/User.js'
import {Cache} from "../Module/Cache.js";
import {Game} from "../Tools/index.js";
import {sequelize} from "../Services/DatabaseService.js";

export default class UserDataProvider {
    /**
     * Discord user object
     * {object}
     * @private
     */
    _discordUser

    constructor(discordUser) {
        this._discordUser = discordUser;
    }

    /**
     * Genshin | Star Rail
     * Validate EU uid only
     * @private
     * @param uid
     */
    validateUid(uid) {
        return uid > 700000000 && uid < 800000000
    }

    /**
     * Retrieve cached game data
     * @public
     */
    fetchInGameData(uid, game) {
        let cacheKey;
        if (game === Game.Genshin) {
            cacheKey = 'gen';
        } else if (game === Game.StarRail) {
            cacheKey = 'sr';
        } else {
            throw new Error('Invalid game');
        }

        cacheKey += `_${uid}`;

        if (!Cache.retrieve(cacheKey)) {
            // TODO : make api call
        }
    }

    /**
     * Create or Update user info
     * @param uid
     * @param game
     * @returns {Promise<{}>}
     */
    async setGameUid(uid, game) {
        if (game === Game.Genshin || game === Game.StarRail) {
        } else {
            throw new Error('Invalid game');
        }

        let response = {}
        let data = {userId: this._discordUser.id, uid: uid, game: game}

        try {
            // Find or create the user
            const [user, created] = await User(sequelize).findOrCreate({
                where: {userId: this._discordUser.id, uid: uid, game: game},
                defaults: data
            })

            if (!created) {
                // Don't update when there is no diff
                if (user.id ===  this._discordUser.id && user.uid === uid && user.game === game) {
                    response = {
                        status: 'error',
                        message: 'Les informations sont déjà les mêmes !'
                    }
                }

                const userUpdate = await user.update(
                    data,
                    { where: { userId: user.id, game: game } }
                )

                // First el => 1 query
                if (userUpdate.uid === uid && userUpdate.game === game) {
                    response = {
                        status: 'updated',
                        message: 'Vos informations ont été mis à jour !'
                    }
                }
            } else {
                response = {
                    status: 'created',
                    message: 'Les informations ont bien été ajoutées'
                }
            }

            if (response.status === 'created' || response.status === 'updated') {
                response.data = data
                // Clear cache if exists
                this.clear()
            }

        } catch (error) {
            console.log(error)
            // Handle error response
            response = {
                success: 'error',
                message: 'Une erreur est survenue sur la commande UID'
            }
        }

        return response
    }

    /**
     * Get (cached) game uid
     * @param game
     * @returns {Promise<{}>}
     */
    async getGameUid(game) {
        let response = {}
        let cacheKey = `${game}_${this._discordUser.id}`

        try {
            let data = await Cache.retrieve(cacheKey)
            if (!data) {
                // If the data is not cached
                const userResponse = await User(sequelize).findOne({
                    where: {userId: this._discordUser.id, game: game}
                })

                response.status = 'success'
                if (userResponse !== null) {
                    data = {
                        name: userResponse.name,
                        uid: userResponse.uid,
                        game: game,
                        user: this._discordUser
                    }
                    Cache.set(cacheKey, data)
                } else {
                    response.message = "L'utilisateur n'a pas encore enregistré son uid"
                }
            }

            response.data = data
        } catch (error) {
            console.log(error)
            response = {
                success: 'error',
                message: 'Une erreur est survenue sur la commande UID'
            }
        }

        return response
    }

    /**
     * Return genshin user cache key
     * @return {string}
     */
    get genshinCacheKey() {
        return `${Game.Genshin}_${this._discordUser.id}`
    }

    /**
     * Return star rail user cache key
     * @return {string}
     */
    get starRailCacheKey() {
        return `${Game.StarRail}_${this._discordUser.id}`
    }

    /**
     * Clear cached data
     * @return true
     */
    clear() {
        if (Cache.has(this.genshinCacheKey))
            Cache.clear(this.genshinCacheKey)
        if (Cache.has(this.starRailCacheKey))
            Cache.clear(this.starRailCacheKey)
        return true
    }
}
