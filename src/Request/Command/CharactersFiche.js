import {request} from 'undici'
import {config} from 'dotenv'
import {GudaToken} from "../../Module/GudaToken.js"
config()

export async function getCharacters() {
    return await fetchResponse('character-fiche/get-characters')
}

export async function getRoles() {
    return await fetchResponse('character-fiche/get-roles')
}

export async function getCharacterFiche(characterId, roles = null) {
    return await fetchResponse(`character-fiche/get/${characterId}`, roles, "POST")
}

/**
 *
 * @param endpoint
 * @param data
 * @param method
 * @returns {Promise<null>}
 */
async function fetchResponse(endpoint, data = null, method = "GET") {
    let results = null;
    const {statusCode, body} = await gudapiEndpointRequest(endpoint, data, method)

    if (statusCode === 200) {
        results = await body.json().then(res => {
            return res
        }).catch(err => {
            return null
        })
    }

    return results;
}

/**
 * @param endpoint
 * @param data
 * @param method
 * @returns {Promise<Dispatcher.ResponseData>}
 */
async function gudapiEndpointRequest(endpoint, data = null, method = "GET") {
    let gudaToken = await GudaToken.getBearerToken()
    let headers = {
        "Authorization": "Bearer " + gudaToken,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    return await request(
        process.env.GUDASHBOARD_BASE_URL + endpoint,
        {
            method: method,
            headers: headers,
            body: data
        }
    )
}
