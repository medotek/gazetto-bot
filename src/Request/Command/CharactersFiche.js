import {request} from 'undici'
import {config} from 'dotenv'
import {GudaToken} from "../../Module/GudaToken.js"

config()

export async function getCharacters() {
    let results = null;
    const {statusCode, body} = await gudapiEndpointRequest('character-fiche/get-characters')

    if (statusCode === 200) {
        results = await body.json().then(res => {
            return res
        }).catch(err => {
            return null
        })
    }

    return results;
}

export async function getRoles() {
    let results = null;
    const {statusCode, body} = await gudapiEndpointRequest('character-fiche/get-roles')

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
 * Available endpoints
 * - 'character-fiche/get-characters'
 * @returns {Promise<Dispatcher.ResponseData>}
 */
async function gudapiEndpointRequest(endpoint) {
    let gudaToken = await GudaToken.getBearerToken()
    let headers = {
        "Authorization": "Bearer " + gudaToken,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    return await request(
        process.env.GUDASHBOARD_BASE_URL + endpoint,
        {
            method: "GET",
            headers: headers
        }
    )
}
