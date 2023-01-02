const fs = require('fs')
const path = require('path')
const fileName = path.join(__dirname, '..', '..', 'config', 'config.json');

module.exports = function Upgrade(newVersion) {
    try {
        let data = fs.readFileSync(fileName, 'utf-8');
        if (data) data = JSON.parse(data)
        if (data.hasOwnProperty('version'))
            if (typeof newVersion === 'number' && newVersion > data.version) {
                data.version = newVersion
                fs.writeFileSync(fileName, JSON.stringify(data), 'utf-8')
                return true
            } else {
                console.log("==================================================================")
                console.log("La version actuelle est supérieure ou égale à la version d'upgrade")
                console.log("==================================================================")
            }
    } catch (err) {
        console.error(err)
        console.log("==================================================================")
    }

    return false
}

