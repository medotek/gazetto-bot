import {User} from '../Models/User.js'

export const UserDataProvider = async (crudAction, sequelize, discordUser, uuid = undefined, name = undefined) => {
    if ((!name && crudAction !== 'read')
        || (!uuid && crudAction !== 'read')
        || !crudAction) {
        return {
            status: 'error',
            message: "An error occurred"
        }
    }

    // Not EU uid
    if (uuid > 799999999 || uuid < 700000000) {
        return {
            status: 'error',
            message: "L'uid est invalide"
        }
    }

    let response = {
        status: 'undefined',
        message: 'undefined'
    };

    if (crudAction === 'update') {
        try {
            const [user, created] = await User(sequelize).findOrCreate({
                where: {userId: discordUser.id},
                defaults: {
                    name: name,
                    uid: uuid
                }
            })

            if (!created) {
                // Don't update when there is no diff
                if (user.name === name && user.uid === uuid) {
                    response = {
                        status: 'error',
                        message: 'Les informations sont déjà les mêmes !'
                    }

                }

                const userUpdate = await user.update(
                    {
                        name: name,
                        uid: uuid
                    },
                    {
                        where: {
                            userId: user.id
                        }
                    })

                // First el => 1 query
                if (userUpdate.name === name && userUpdate.uid === uuid) {
                    response = {
                        status: 'updated',
                        message: 'Vos informations ont été mis à jour !',
                        data: {
                            name: name,
                            uid: uuid
                        }
                    }
                }
            } else {
                response = {
                    status: 'created',
                    message: 'Les informations ont bien été ajoutées',
                    data: {
                        name: name,
                        uid: uuid
                    }
                }
            }
        } catch (error) {
            console.log(error)
            response = {
                success: 'error',
                message: 'Une erreur est survenue sur la commande UID'
            }
        }
    }

    if (crudAction === 'read') {
        try {
            const userResponse = await User(sequelize).findOne({
                where: {
                    userId: discordUser.id
                }
            })

            response.status = 'success'
            if (userResponse !== null) {
                response = {
                    message: "Informations de `" + discordUser.username + "`",
                    data: {
                        name: userResponse.name,
                        uid: userResponse.uid,
                        user: discordUser
                    }
                }
            } else {
                response.message = "L'utilisateur n'a pas encore enregistré son uid"
            }

        } catch (error) {
            console.log(error)
            response = {
                success: 'error',
                message: 'Une erreur est survenue sur la commande UID'
            }
        }
    }

    return response
}
