const User = require('../Models/User')

module.exports = async (crudAction, sequelize, userId, uuid, name) => {
    if (!name
        || !uuid
        || !crudAction) {
        return {
            status: 'error',
            detail: "An error occurred"
        }
    }

    // Not EU uid
    if (uuid > 800000000 || uuid < 700000000) {
        return {
            status: 'error',
            detail: "L'uid est invalide"
        }
    }

    if (crudAction === 'update') {
        const [user, created] = await User(sequelize).findOrCreate({
            where: {userId: userId},
            defaults: {
                name: name,
                uid: uuid
            }
        })

        if (!created) {
            const userUpdate = await user.update(
                {
                    name: name,
                    uid: uuid
                },
                {
                    where: {
                        userId: userId
                    }
                })

            // First el => 1 query
            if (userUpdate[0]) {
                console.log('updated')
            }
        } else {
            console.log('created')
        }
    }
}
