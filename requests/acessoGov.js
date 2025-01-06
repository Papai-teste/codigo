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
            throw new Error(msg.GC20);
        }
    },

    buscarChavePublica: async (req) => {
        const options = buildOptions({ req });
        try {
            const resp = await acessoGov.get('/jwk', options);
            if (!resp || !resp.data){
                throw new Error();
            }
            return resp.data.keys[0];
        } catch (error) {
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
            // Retorna avatar padrão
            const fotoavatar = 'iVBORw0KGgoAAAANSUhEUgAAAH8AAAB/CAMAAADxY+0hAAAAY1BMVEX///8WFhbu7u4AAAB5eXn8/Pz5+fne3t4ODg719fXy8vIKCgoTExPp6ekGBga6uro6OjpISEienp6Hh4fJycmtra3CwsKWlpbS0tIzMzNhYWEuLi6kpKQbGxtVVVU/Pz9vb29yJLQAAAACqElEQVRoge3bW3OqQAwAYNggLIIIeEME7P//lYe1WqvuYhIFp2eSl3b6wLfsJSQ7Uy9Sn4zIU94nQ4kvvvjiiy+++OKLL7744osv/rMIq03TNNvFR/zZsoNzHEr2ENj+NgdI/e/Q0O7mk/pxAIn/K1Ioogn9uAD/LjJYT+bPjg+8mYJqKj+w8P0u0Iw9wPGXVt73IZjED4+J3fcZK8DwXa/f+/UUfpG5/LQlH0K6r/zU5fuwHN9fO6efswPp/mbAz4rx/XLA1/v/328G/OQ4vu8+/pwEQPejZOD8leP73kG7fXICZvg75wIkRTiBHzkTIDTUZ7G+vyvHBOh9PIkf7+0fYE4Fxqp/KrBtQdjRn8SsP5eWAXCqH3b9vYW7PaBhxXkOu/9QNWTXY5DAgVV9v9J/VXUGkGid9A1YUc6YT3ml/4w2X0WeH+uyop+7d/jviBf8+SK6BL8D5/nz9a5r0+TSf2faz4MlqwHl+NGq772z9CY0QFuvyZ8fhr8IwJr++gYUuu3ofnO9dniMDGpiD0ryZ96iG9BPWTihJSLa+1f7geLvkohJRQDJj9qnvNkGpYfPhhRfta7G+24NCF0gwQ9tty72AeDLUILvKrseQ+foU4D31092/s0EoIsBvJ/jFv8UKWCTMdofarssE4BtxNC+89LptQnA+hHp9fHFMNZ3N1320Ie3+mFHmn4zAbiaBOkrwuE7+5t3+tTlR6cApE87fSf/653+0KWTPZIOVYwhfXzu//FxdxFIvwFydKgiAOnHu4AauAT4h/sf8cUXX3zxxRdffPGn82eXCH9+m8T/Nk3E8fwacR/mj/SBMHxjG1wt+jCX730oZUbBGAF1/k9T/uv91Uk2M2Dw8f3zGM7rcPuTswf+6P4XX3zxxRdf/D/uf/j/3/8B/CkfcRXTRGcAAAAASUVORK5CYII=';
            return `data:image/png;base64,${fotoavatar}`;
        }
    },
};
