import {request, Headers} from 'undici'
import {config} from 'dotenv'
import {GudaToken} from "../../Module/GudaToken.js"

config()

export async function getCharacters() {
    let results = null;
    const {statusCode, body} = await gudapiCharactersFicheRequest()


    if (statusCode === 200) {
        results = await body.json().then(res => {
            return res
        }).catch(err => {
            return null
        })
    }

    return results;
}

async function gudapiCharactersFicheRequest() {
    let gudaToken = await GudaToken.getBearerToken()
    let headers = {
        "Authorization": "Bearer " + gudaToken,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    return await request(
        process.env.GUDASHBOARD_BASE_URL + 'character-fiche/get-characters',
        {
            method: "GET",
            headers: headers
        }
    )
}
