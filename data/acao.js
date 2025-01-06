const { selectAcao } = require('../db/acao')
const redis = require('../redis')

module.exports = {
    selectAcao: async (sigla) => {
        let data = await redis.get("ACAO", sigla)
        if (!data) {
            data = (await selectAcao(sigla)).rows
            if (data.length)
                await redis.set("ACAO", sigla, data)
        }
        return data;
    }
}