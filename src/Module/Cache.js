/**
 * Declare cache as service for the overall app
 */
import {CacheService} from "../Services/CacheService.js"
const ttl = 60 * 60 * 24; // 24h

export const Cache = new CacheService(ttl)
