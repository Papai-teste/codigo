const { query } = require('./index')

module.exports = {
    selectCliente: async (cnpj) => {
        const sql = 'SELECT * from cliente where cnpj_cliente = $1';
        const values = [cnpj];
        return await query(sql, values);
    },
    updateCliente: async (cnpj, chavePublica) => {
        const sql = 'update cliente set chave_publica_cliente = $1 where cnpj_cliente = $2;';
        const values = [chavePublica, cnpj];
        return await query(sql, values);
    }
}
