const config = require('../config');
const integracao = require('../db/listaIntegracao');
const { createAxiosInstance } = require('./common/axiosFactory');
const buildOptions = require('./common/optionsBuilder');

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

        const tokenContas = await contas.post(
            config.INTEGRATION_API_CONTAS_TOKEN_URL,
            new URLSearchParams({
                'grant_type': 'client_credentials',
                'scope': config.INTEGRATION_API_CONTAS_TOKEN_SCOPE
            }).toString(),
            tokenOptions
        );

        const options = buildOptions({
            req,
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${tokenContas.data.access_token}`
            }
        });

        return await contas.get("/" + cpf, options);
    }
};
