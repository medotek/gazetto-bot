/**
 * Declare cache as service for the overall app
 */
const {CacheService} = require("../Services/CacheService");
const ttl = 60 * 60 * 24; // 24h

exports.cache = new CacheService(ttl)
