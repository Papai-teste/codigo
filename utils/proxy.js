const config = require('../config');

function getProxyConfig() {
    if (config.APP_PROXY_USER) {
        return {
            protocol: 'http',
            host: 'proxy.intra-serpro',
            port: 3128,
            auth: {
                username: config.APP_PROXY_USER,
                password: config.APP_PROXY_PASSWORD,
            },
        };
    }
    return null;
}

module.exports = getProxyConfig;
