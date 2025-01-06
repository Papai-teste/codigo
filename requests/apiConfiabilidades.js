const config = require('../config');
const integracao = require('../db/listaIntegracao');
const { createAxiosInstance } = require('./common/axiosFactory');
const buildOptions = require('./common/optionsBuilder');
const msg = require('../db/listaErros');

const apiConfiabilidades = createAxiosInstance(config.INTEGRATION_API_CONFIABILIDADES_URL, integracao.API_CONFI);

module.exports = {
    buscarSelo: async (req, cpf, ip, accessToken) => {
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            cpf: cpf,
        };

        const options = buildOptions({ req, headers, ip });
        let response;
        try {
            response = await apiConfiabilidades.get(`/${cpf}/niveis?response-type=ids`, options);
        } catch (error) {
            console.error("Erro na consulta de selos no API Confiabilidades: " + error);
            throw new Error(msg.GC60);
        }
        
        const niveis = response.data;

        if (!Array.isArray(niveis) || niveis.length === 0) {
            return null;
        }

        const maxSeloId = Math.max(...niveis.map((selo) => parseInt(selo.id, 10)));
        const seloDescricaoMap = {
            1: 'Bronze',
            2: 'Prata',
            3: 'Ouro',
        };

        return seloDescricaoMap[maxSeloId] || null;
    },
};
