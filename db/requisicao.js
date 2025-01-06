const { query } = require('./index')

module.exports = {
    insertRequest: (inicioReq, fimReq, statusCode, idConsentimento) => {
        const sql = 'INSERT INTO public.requisicao(data_hora_inicio_requisicao, data_hora_fim_requisicao, codigo_retorno_requisicao, id_consentimento) VALUES (?, ?, ?, ?) returning id_requisicao';
        const values = [inicioReq, fimReq, statusCode, idConsentimento];
        return query(sql, values);
    },
}
