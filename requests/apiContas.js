const config = require('../config');
const integracao = require('../db/listaIntegracao');
const { createAxiosInstance } = require('./common/axiosFactory');
const buildOptions = require('./common/optionsBuilder');
const msg = require('../db/listaErros');

const contas = createAxiosInstance(config.INTEGRATION_API_CONTAS_URL, integracao.API_CONTAS);

module.exports = {
    consultarDadosBasicos: async (req, cpf) => {
        const tokenOptions = {
            req,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "Authorization": config.INTEGRATION_API_CONTAS_AUTHORIZATION
            }
        };

        let tokenContas;
        try {
            tokenContas = await contas.post(
                config.INTEGRATION_API_CONTAS_TOKEN_URL,
                new URLSearchParams({
                    'grant_type': 'client_credentials',
                    'scope': config.INTEGRATION_API_CONTAS_TOKEN_SCOPE
                }).toString(),
                tokenOptions
            );
        } catch (error) {
            console.error("Erro na obtenção do token no API Contas: " + error);
            throw new Error(msg.GC65);
        }

        const options = buildOptions({
            req,
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${tokenContas.data.access_token}`
            }
        });

        let resultado;
        try {
            resultado = await contas.get("/" + cpf, options);
        } catch (error) {
            console.error("Erro na consulta de dados básicos no API Contas: " + error);
            throw new Error(msg.GC65);
        }

        return resultado;
    }
};
