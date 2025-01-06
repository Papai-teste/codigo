const { query } = require('./index')

module.exports = {
    selectIntegracao: async (sigla) => {
        const sql = 'SELECT * from integracao where sigla_integracao = $1';
        const values = [sigla];
        return await query(sql, values);
    }
}
