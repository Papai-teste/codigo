const { query } = require('./index')

module.exports = {
    selectTemplateApi: async (idTemplate) => {
        const sql = 'select * '+
    'from '+
        'template_consentimento t, '+
        'api a '+
    'where '+
        't.id_template_consentimento = $1 '+
        'and a.codigo_api = t.codigo_api';
        const values = [idTemplate];
        return await query(sql, values);
    }
}
