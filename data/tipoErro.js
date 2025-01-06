const { selectTipoErro } = require('../db/tipoErro')
const redis = require('../redis')

module.exports = {
    selectTipoErro: async (sigla) => {
        let data = await redis.get("TIPO_ERRO", sigla)
        if (!data) {
            data = (await selectTipoErro(sigla)).rows
            if (data.length)
                await redis.set("TIPO_ERRO", sigla, data)
            else
                data = [{id_tipo_erro : "GC00 - Erro não esperado.", descricao_tipo_erro: "GC00 - Erro não esperado."}]
        }
        return data;
    }
}