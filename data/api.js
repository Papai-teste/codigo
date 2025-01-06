const { selectApi, selectApiFromURL } = require('../db/api')
const redis = require('../redis')

module.exports = {
    selectApi: async (codigoApi) => {
        let data = await redis.get("API", codigoApi)
        if (!data) {
            data = (await selectApi(codigoApi)).rows
            if (data.length)
                await redis.set("API", codigoApi, data)
        }
        return data;
    },
    selectApiFromURL: async (urlApi) => {
        let data = await redis.get("API_URL", urlApi)
        if (!data) {
            data = (await selectApiFromURL(urlApi)).rows
            if (data.length)
                await redis.set("API_URL", urlApi, data)
        }
        return data;
    }
}