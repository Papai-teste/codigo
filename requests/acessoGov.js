const config = require('../config');
const url = require('url');
const integracao = require('../db/listaIntegracao');
const { createAxiosInstance } = require('./common/axiosFactory');
const buildOptions = require('./common/optionsBuilder');
const isNonEmptyString = require('../utils/isNonEmptyString');
const msg = require('../db/listaErros');

const acessoGov = createAxiosInstance(config.INTEGRATION_ACESSOGOV_URL, integracao.ACESSO_GOV);

module.exports = {
    isValidCode: async (req, code, redirectUri, ip) => {
        if (!code || !isNonEmptyString(code)) {
            throw new Error(msg.GC20)
        }
        code =  code.trim();
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${config.INTEGRATION_ACESSOGOV_AUTHORIZATION}`,
        };
        const options = buildOptions({ req, headers, ip });
        const data = new url.URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
        }).toString();
        try {
            return await acessoGov.post('/token', data, options);
        } catch (error) {
            console.error("Erro na validação do código no AcessoGov: " + error);
            throw new Error(msg.GC20);
        }
    },

    buscarChavePublica: async (req) => {
        const options = buildOptions({ req });
        try {
            const resp = await acessoGov.get('/jwk', options);
            if (!resp || !resp.data){
                throw new Error(msg.GC59);
            }
            return resp.data.keys[0];
        } catch (error) {
            console.error("Erro na busca de chave pública no AcessoGov: " + error);
            throw new Error(msg.GC59);
        }    
    },

    buscarFoto: async (req, accessToken, ip) => {
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };

        const options = buildOptions({ req, headers, responseType: 'arraybuffer', ip });

        try {
            const resp = await acessoGov.get('/userinfo/picture', options);
            const contentType = resp.headers['content-type'];

            if (contentType) {
                const base64Image = Buffer.from(resp.data).toString('base64');
                return `data:${contentType};base64,${base64Image}`;
            }
        } catch (error) {
            console.error("Erro na busca de foto no AcessoGov: " + error);
            // Retorna avatar padrão
            const fotoavatar = 'iVBORw0KGgoAAAANSUhEUgAAAH8AAAB/CAMAAADxY+0hAAAAY1BMVEX///8WFhbu7u4AAAB5eXn8/Pz5+fne3t4ODg719fXy8vIKCgoTExPp6ekGBga6uro6OjpISEienp6Hh4fJycmtra3CwsKWlpbS0tIzMzNhYWEu[...]';
            return `data:image/png;base64,${fotoavatar}`;
        }
    },
};
