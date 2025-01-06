const config = require('../config');
const integracao = require('../db/listaIntegracao');
const { createAxiosInstance } = require('./common/axiosFactory');
const buildOptions = require('./common/optionsBuilder');
const https = require('https');
const msg = require('../db/listaErros');

// Caso seja necessário manter a não verificação TLS, utilize um httpsAgent customizado.
// Idealmente, ajuste a cadeia de certificados em produção.
const insecureAgent = new https.Agent({ rejectUnauthorized: false });

const cpfLight = createAxiosInstance(config.INTEGRATION_CONSULTA_CPF_URL, integracao.CPF_LIGHT, {}, insecureAgent);

module.exports = {
    consultarCPF: async (req, cpf) => {
        try {
            const tokenResponse = await cpfLight.post(
                config.INTEGRATION_CONSULTA_CPF_TOKEN,
                'grant_type=client_credentials',
                {
                    req,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + Buffer.from(`${config.INTEGRATION_CONSULTA_CPF_USER}:${config.INTEGRATION_CONSULTA_CPF_PASS}`).toString('base64'),
                    }
                }
            );

            const accessToken = tokenResponse.data.access_token;
            const options = buildOptions({
                req,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return await cpfLight.get("/" + cpf, options);
        } catch (error) {
            if (error.response.status === 404) {
                throw new Error(msg.GC29);
            }
            throw new Error(msg.GC35);
        }
    }
};
