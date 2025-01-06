const config = require('../config');
const integracao = require('../db/listaIntegracao');
const { createAxiosInstance } = require('./common/axiosFactory');
const buildOptions = require('./common/optionsBuilder');
const msg = require('../db/listaErros');

const pdc = createAxiosInstance(config.INTEGRATION_PDC_URL, integracao.PDC, {
    "Authorization": config.INTEGRATION_PDC_AUTHORIZATION
});

module.exports = {
    pdcObterTemplate: (req, cnpjControlador, idTemplate) => {
        const options = buildOptions({ req })
        let resultado = null;
        try{
            resultado = pdc.get(`/template/${cnpjControlador}/${idTemplate}`, options);
        } catch (error) {
            console.error("Erro na consulta ao template no PDC: "+error)
            throw new Error(msg.GC58);
        }
        return resultado;
    },
    pdcConsultarConsentimento: (req, idConsentimento) => {
        const options = buildOptions({ req });
        let resultado = null;
        try{
            resultado = pdc.get(`/consentimento/${idConsentimento}`, options);
        } catch (error) {
            console.error("Erro na consulta ao consentimento no PDC: "+error)
            throw new Error(msg.GC58);
        }
        return resultado;
    },
    pdcSolicitarConsentimento: (req, cnpjControlador, cpf, idTemplate, dataExpiracao) => {
        const requestData = {
            cpf,
            templates: [{ dataExpiracao, idConsentimentoTemplate: idTemplate }]
        };
        const options = buildOptions({ req });
        let resultado = null;
        try{
            resultado = pdc.post(`/consentimento/${cnpjControlador}`, requestData, options);
        } catch (error) {
            console.error("Erro na solicitação dso consentimento no PDC: "+error)
            throw new Error(msg.GC58);
        }
        return resultado;
    },
    pdcRegistrarTratamento: (req, cnpjControlador, cpf, dataInicioTratamento, idTratamento, infoExt, metadados) => {
        const requestData = {
            cpf,
            dataInicioTratamento,
            idTratamento,
            infoExt,
            metadadosTratados: metadados
        };
        const options = buildOptions({ req });
        let resultado = null;
        try{
            resultado = pdc.post(`/tratamento/registro/${cnpjControlador}`, requestData, options);
        } catch (error) {
            console.error("Erro no registro do tratamento no PDC: "+error)
            throw new Error(msg.GC58);
        }
        return resultado;
    },
    pdcAprovarConsentimento: async (req, cpf, idConsentimento) => {
        const options = buildOptions({ req });
        let resultado = null;
        try{
            resultado = await pdc.put(`/titular/${cpf}/consentir/${idConsentimento}`, {}, options);
        } catch (error) {
            // Se for um erro de requisição (HTTP)
            if (error.response) {
                // Verifica se o status retornado foi 422
                if (error.response.status === 422) {
                    // Imprime a mensagem do erro no console
                    console.error('Erro 422 (Unprocessable Entity):', error.response.data);
                    throw new Error(msg.GC63);
                } else {
                    // Caso queira logar todos os outros status
                    console.error(`Erro de requisição (Status: ${error.response.status}):`, error.response.data);
                }
            } else {
                // Erro que não veio com response (pode ser erro de rede, timeout etc.)
                console.error("Erro no negar consentimento no PDC (sem response):", error.message);
            }
            // Continue “propagando” o erro de forma adequada ao seu fluxo
            throw new Error(msg.GC58);
        }
        return resultado;
    },
    pdcNegarConsentimento: async (req, cpf, idConsentimento) => {
        const options = buildOptions({ req });
        let resultado = null;
        try{
            resultado = await pdc.put(`/titular/${cpf}/negar/${idConsentimento}`, {}, options);
        } catch (error) {
            // Se for um erro de requisição (HTTP)
            if (error.response) {
                // Verifica se o status retornado foi 422
                if (error.response.status === 422) {
                    // Imprime a mensagem do erro no console
                    console.error('Erro 422 (Unprocessable Entity):', error.response.data);
                    throw new Error(msg.GC62);
                } else {
                    // Caso queira logar todos os outros status
                    console.error(`Erro de requisição (Status: ${error.response.status}):`, error.response.data);
                }
            } else {
                // Erro que não veio com response (pode ser erro de rede, timeout etc.)
                console.error("Erro no negar consentimento no PDC (sem response):", error.message);
            }
            // Continue “propagando” o erro de forma adequada ao seu fluxo
            throw new Error(msg.GC58);
        }
        return resultado;
    },
    pdcRevogarConsentimento: (req, cpf, idConsentimento) => {
        const options = buildOptions({ req });
        let resultado = null;
        try{
            resultado = pdc.put(`/titular/${cpf}/revogar/${idConsentimento}`, {}, options);
        } catch (error) {
            console.error("Erro no revogar consentimento no PDC: "+error)
            throw new Error(msg.GC58);
        }
        return resultado;
    }
};
