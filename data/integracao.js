const { selectIntegracao } = require('../db/integracao')
const redis = require('../redis')

module.exports = {
    selectIntegracao: async (sigla) => {
        let data = await redis.get("INTEGRACAO", sigla)
        if (!data) {
            data = (await selectIntegracao(sigla)).rows
            console.log("Data: "+JSON.stringify(data))
            if (data.length)
                await redis.set("INTEGRACAO", sigla, data)
        }
        return data;
    }
}