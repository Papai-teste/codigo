const { query } = require('./index')

module.exports = {
    selectTipoErro: async (sigla) => {
        const sql = 'SELECT * from tipo_erro where sigla_tipo_erro = $1';
        const values = [sigla];
        return await query(sql, values);
    }
}
