const { query } = require('./index')

module.exports = {
    selectAcao: async (sigla) => {
        const sql = 'SELECT * from acao where sigla_acao = $1';
        const values = [sigla];
        return await query(sql, values);
    }
}
