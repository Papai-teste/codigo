'use strict';
const config = require('../config');
const integracao = require('../db/listaIntegracao');
const fs = require('fs');
const { createAxiosInstance } = require('./common/axiosFactory');
const buildOptions = require('./common/optionsBuilder');
const https = require('https');

const configuredHttpsAgent = new https.Agent({
    pfx: fs.readFileSync(config.SECURITY_PATH_KEY + 'gaap_certificado.p12'),
    passphrase: config.APP_PRIVATEKEY_PASS
});

const senatran = createAxiosInstance(
    config.INTEGRATION_SENATRAN_URL,
    integracao.SENATRAN,
    {
        "content-type": "application/json",
        "x-cpf-usuario" : config.INTEGRATION_SENATRAN_CPF_USUARIO
    },
    configuredHttpsAgent
);

module.exports = {
    veiculosBasicaProprietarioPlaca: (req, cpf, placa) => {
        const options = buildOptions({ req });
        return senatran.get(`/v3/veiculos/basica/proprietario/${cpf}/placa/${placa}`, options);
    },
    infracoesPorCPF: (req, cpf) => {
        const options = buildOptions({ req });
        return senatran.get(`/v1/infracoes/cpf/${cpf}`, options);
    }
};
