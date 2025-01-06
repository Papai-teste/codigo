const { query } = require('./index')

module.exports = {
    selectApi: async (codigoApi) => {
        const sql = 'SELECT * from api where codigo_api = $1';
        const values = [codigoApi];
        return await query(sql, values);
    },
    selectApiFromURL: async (urlApi) => {
        const sql = 'SELECT * from api where path_api = $1';
        const values = [urlApi.toLowerCase()];
        return await query(sql, values);
    }
}
