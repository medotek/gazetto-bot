import fetch from 'node-fetch';

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
        this.gudapiToken = await this.getCredentials().then(json => {
            if (json.token !== undefined && json.token) {
                this.setLastTimeUpdate()
                return json.token
            } else {
                return null
            }
        }).catch(err => {
            // TODO : maybe log in file
            return null
        });
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
        return await fetch('http://localhost/api/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                email: "discord@gmail.com",
                password: "discord@gmail.com"
            })
        }).then(response => response.json());
    }
}
