import NodeCache from 'node-cache'
const redis = require('redis').createClient()
const redis_client = require('async-redis').createClient();
const node_cache = new NodeCache();
const use_redis = true
const my_cache = {
    get: async function (key) {
        if (use_redis) {
            return JSON.parse(await redis_client.get(key))
        } else {
            return node_cache.get(key)
        }
    },
    set: async function (key, value, ttl) {
        if (use_redis) {
            return await redis_client.set(key, JSON.stringify(value), 'EX', parseInt(ttl))
        } else {
            return node_cache.set(key, value, parseInt(ttl))
        }
    }
}


module.exports = my_cache