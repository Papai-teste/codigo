const { query } = require('./index')

module.exports = {
    selectConsent: async (idConsentimento) => {
        const sql = 'select '+
        'c.id_consentimento, '+
        'c.id_template_consentimento, '+
        'c.cpf_cidadao, '+
        't.codigo_api, '+
        't.cnpj_cliente, '+
        'cli.nome_cliente, '+
        'a.codigo_api, '+
        'a.base_legal, '+
        't.json_template_consentimento, '+
        'cli.chave_publica_cliente, '+
        'c.url_retorno, '+
        'tt.id_template_tratamento, '+
        'a.path_api, '+ 
        'a.id_habilitacao '+
    'from '+
        'consentimento c, '+
        'template_consentimento t, '+
        'template_tratamento tt, '+
        'cliente cli, '+
        'api a '+
    'where '+
        't.id_template_consentimento = c.id_template_consentimento '+
        'and cli.cnpj_cliente = t.cnpj_cliente '+
        'and a.codigo_api = t.codigo_api '+
        'and tt.id_template_consentimento = t.id_template_consentimento '+
        'and id_consentimento = $1';
        const values = [idConsentimento];
        return await query(sql, values);
    }
}
