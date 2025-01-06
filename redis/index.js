'use strict';

const Redis = require("ioredis");
const config = require('../config')
console.log("REDIS",config.REDIS_SERVER)
const redis = new Redis(config.REDIS_SERVER);

module.exports = {
    exists : async (group, key) => {
        return await redis.exists(`${group}:${key}`)
    },
    set : async (group, key, value) => {

        return await redis.set(`${group}:${key}`, JSON.stringify(value))
    },
    get : async (group, key) => {
        const data = await redis.get(`${group}:${key}`)
        return (data ? JSON.parse(data) : undefined)
    }
}