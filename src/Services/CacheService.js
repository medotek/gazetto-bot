const NodeCache = require("node-cache");

class CacheService {
    constructor(ttlSeconds) {
        this.cache = new NodeCache({
            stdTTL: ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones: false
        });
    }

    has(key) {
        return this.cache.has(key)
    }

    retrieveAll() {
        return this.cache.keys()
    }

    set(key, result) {
        return this.cache.set(key, result, this.cache.stdTTL);
        // return storeFunction().then((result) => {
        //     this.cache.set(key, result);
        //     return result;
        // });
    }

    retrieve(key) {
        const value = this.cache.get(key);
        if (value) {
            return Promise.resolve(value);
        }
        return null;
    }

    clear(keys) {
        this.cache.del(keys);
    }

    flush() {
        this.cache.flushAll();
    }
}

module.exports = {
    CacheService
}
