import {request} from 'undici'

/**
 * This class has to be defined on the overall app x bridge : Gu-dahsboard
 * @class GudaTokenService
 */
export class GudaTokenService {
    constructor() {
        this.gudapiToken = null;
        this.lastTimeUpdate = null;
    }

    async getBearerToken() {
        console.log(this.lastTimeUpdate)
        if (this.lastTimeUpdate) {
            console.log('Going to update')
            // + 1h
            let lastTimeUpdateAfter = this.lastTimeUpdate + 3600
            if (Date.now() < lastTimeUpdateAfter) {
                return this.gudapiToken;
            }
        }

        // Add/Update token
        await this.setBearerToken();

        return this.gudapiToken
    }

    async setBearerToken() {
        const { statusCode, headers, trailers, body } = await this.getCredentials()
        if (statusCode === 200) {
            this.gudapiToken = await body.json().then(r => {
                if (r.token !== undefined && r.token) {
                    return r.token
                } else {
                    return null
                }
            }).catch(err => {
                return null
            })
        } else {
            // TODO : log message on discord
            this.gudapiToken = null
        }
    }

    getLastTimeUpdate() {
        return this.lastTimeUpdate;
    }

    setLastTimeUpdate() {
        this.lastTimeUpdate = Date.now();
    }

    /**
     * The way to retrieve the bearer token from Gu-dashboard
     * - login as user / ROLE_BOT
     */
    async getCredentials() {
        return await request('http://localhost/api/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                email: "discord@gmail.com",
                password: "discord@gmail.com"
            })
        });
    }
}
