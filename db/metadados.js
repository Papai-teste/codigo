const { query } = require('./index')

module.exports = {
    selectMetadadosFromAPI: async (codigoApi) => {
        const sql = 'SELECT * from metadados_api where codigo_api = $1';
        const values = [codigoApi];
        return await query(sql, values);
    }
}
