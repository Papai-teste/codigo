const {isValidIP} = require('../../utils/isValidIP');
const getProxyConfig = require('../../utils/proxy');

function buildOptions({ req, headers = {}, responseType, ip }) {
    const options = { req, headers };

    if (responseType) {
        options.responseType = responseType;
    }

    if (ip) {
        if (!isValidIP(ip)) {
            throw new Error('Endereço IP inválido');
        }
        headers['x-forwarded-for'] = ip;
    }

    const proxyConfig = getProxyConfig();
    if (proxyConfig) {
        options.proxy = proxyConfig;
    }

    return options;
}

module.exports = buildOptions;
