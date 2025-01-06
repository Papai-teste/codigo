const { selectMetadadosFromAPI } = require('../db/metadados')
const redis = require('../redis')

module.exports = {
    selectMetadadosFromAPI: async (codigoApi) => {
        let data = await redis.get("METADADOS", codigoApi)
        if (!data) {
            console.log("Consulta no DB Metadados")
            data = (await selectMetadadosFromAPI(codigoApi)).rows
            if (data.length)
                await redis.set("METADADOS", codigoApi, data)
        }
        return data;
    }
}
