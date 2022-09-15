export function roleFieldBuilder(value, inline = false, label = null) {
    let roleField = {
        "name": label ? label : `Role(s)`,
        "value": value
    }
    inline ? roleField.inline = true : '';
    return roleField
}

export function formattedRoles(roles) {
    let rolesArray = [];
    if (roles && Array.isArray(roles) && roles.length) {
        roles.forEach(role => {
            if (typeof role === "object" && role.hasOwnProperty("name") && role.name)
                rolesArray.push(role.name)
        })
    }

    if (rolesArray.length) {
        return rolesArray.join(', ')
    }

    return null
}
