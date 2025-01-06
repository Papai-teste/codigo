const axios = require('axios');
const http = require('http');
const https = require('https');

function createAxiosInstance(baseURL, integracaoSigla, defaultHeaders = {}, httpsAgent = null) {
    const instance = axios.create({
        baseURL,
        headers: defaultHeaders,
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: httpsAgent || new https.Agent({ keepAlive: true }),
    });

    instance.interceptors.request.use((requestConfig) => {
        requestConfig.integration = {
            start: new Date(),
            siglaIntegracao: integracaoSigla,
        };
        return requestConfig;
    });

    instance.interceptors.response.use(
        (response) => {
            const { integration, req } = response.config;
            integration.end = new Date();
            integration.statusCode = response.status;
            if (req && req.local && req.local.message && Array.isArray(req.local.message.integracoes)) {
                req.local.message.integracoes.push(integration);
            }
            return response;
        },
        (error) => {
            if (error.response && error.response.config && error.response.config.integration) {
                const { integration, req } = error.response.config;
                integration.end = new Date();
                integration.statusCode = error.response.status;
                if (req && req.local && req.local.message && Array.isArray(req.local.message.integracoes)) {
                    req.local.message.integracoes.push(integration);
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
}

module.exports = { createAxiosInstance };
