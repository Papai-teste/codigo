'use strict';

const { pdcConsultarConsentimento, pdcRegistrarTratamento} = require('../../../../requests/pdc');
const { veiculosBasicaProprietarioPlaca } = require('../../../../requests/senatran');
const { selectConsent } = require('../../../../data/consentimento');
const { selectAcao } = require('../../../../data/acao');
const { selectTipoErro } = require('../../../../data/tipoErro');
const { isValidCPF } = require('../../../../utils/isValidCPF');
const config = require('../../../../config')
const { encryptStringWithPublicKeyX509 } = require('../../../../security/encrypt');
const { decryptStringWithPrivateKey } = require('../../../../security/decrypt');
const { isAuthenticated } = require('../../../../filter/auth')
const msg = require('../../../../db/listaErros');
const acao = require('../../../../db/listaAcao');

async function buscarAcao(sigla) {
    const acao = await selectAcao(sigla);
    return acao[0].id_acao;
}
async function buscarDescricaoErro(req, sigla) {
    const erro = await selectTipoErro(sigla);
    req.local.message.idTipoErro = erro[0].id_tipo_erro
    return erro[0].descricao_tipo_erro;
}

module.exports = function (app) {
    app.get('/v1/senatran/veiculos/basica/proprietario/:cpf/placa/:placa', isAuthenticated, async (req, res) => {
        /*
        #swagger.parameters['cpf'] = { 
            in: 'path',
            description: "CPF a ser consultado no SENATRAN",
            required: true
        }

        #swagger.parameters['placa'] = { 
            in: 'path',
            description: "Placa do veículo a ser consultado no SENATRAN",
            required: true
        }
        #swagger.parameters['id-consentimento'] = { 
            in: 'header',
            description: "Identificador do consentimento",
            required: true
        }

        #swagger.security = [{
            "bearerAuth": []
        }]

        #swagger.responses[200] = { description: 'Consulta realizada com sucesso.', 
                                    schema: {"dados":[{"chave":"anoFabricacao",descricao:"Ano de fabricação do veículo","valor":"bWV1IG5vbWU="}]}
                                  }
        #swagger.responses[400] = { description: 'Bad Request' }
        #swagger.responses[401] = { description: 'Unauthorized' }
        #swagger.responses[404] = { description: 'Registro não encontrado na base' }
        #swagger.responses[422] = { description: 'Unprocessable Entity' }
        #swagger.responses[429] = { description: 'Too Many Requests' }
        #swagger.responses[500] = { description: 'Internal Server Error' }
        #swagger.responses[502] = { description: 'Erro em alguma das APIs consumidas pelo GaaP' }
        */
        const cpf = req.params.cpf;
        const placa = req.params.placa;
        const idConsentimento = req.header('id-consentimento');
        const cnpjCliente = req.local.cnpj;
        req.local.message.idAcao = await buscarAcao(acao.SEN_VEIC_CPF_PL);
        req.local.message.idConsentimento = idConsentimento;
        //valida CPF
        if (await isValidCPF(cpf) == false){
            req.local.message.observacao = "CPF: "+ cpf
            return res.status(422).send(await buscarDescricaoErro(req, msg.GC05))
        }
        //valida consentimento
        if (idConsentimento == undefined || idConsentimento == null ||
            idConsentimento.length == 0 || idConsentimento.length > 24){
            req.local.message.observacao = "Consentimento: "+ idConsentimento
            req.local.message.idConsentimento = undefined
            return res.status(422).send(await buscarDescricaoErro(req, msg.GC07))
        }
        const dataConsentimento = await selectConsent(idConsentimento);
        //verificar se a URL informada pertence a API
        if (config.CHECK_TOKEN_WSO2.localeCompare("true") == 0 &&
            req.local.idApi != dataConsentimento[0].codigo_api) {
            req.local.message.observacao = "Código da API informado no JWT: "+ req.local.idApi + " Código da API do consentimento informado: "+dataConsentimento[0].codigo_api
            return res.status(422).send(await buscarDescricaoErro(req, msg.GC28))
        }
        if (dataConsentimento.length == 0) {
            req.local.message.observacao = "Consentimento: "+ idConsentimento
            req.local.message.idConsentimento = undefined
            return res.status(422).send(await buscarDescricaoErro(req, msg.GC04))
        }
        if (dataConsentimento[0].cnpj_cliente != cnpjCliente) {
            req.local.message.observacao = "CNPJ do cliente informado: "+ cnpjCliente + " CNPJ do template do consentimento cadastrado: "+dataTemplateApi[0].cnpj_cliente
            return res.status(422).send(await buscarDescricaoErro(req, msg.GC02))
        }
        if (dataConsentimento[0].cpf_cidadao != cpf) {
            req.local.message.observacao = "CPF informado: "+ cpf + " CPF do consentimento cadastrado: "+dataConsentimento[0].cpf_cidadao
            return res.status(422).send(await buscarDescricaoErro(req, msg.GC14))
        }
        let responsePDC = null;
        try {
            responsePDC = await pdcConsultarConsentimento(req, idConsentimento);
            //valida consentimento
            if (responsePDC.data.status != "ATIVO") {
                req.local.message.observacao = "Status Consentimento: "+ responsePDC.data.status
                return res.status(422).send(await buscarDescricaoErro(req, msg.GC15))
            }
            if (responsePDC.data.titular.cpf != cpf) {
                req.local.message.observacao = "CPF informado: "+ cpf + " CPF do consentimento no PDC: "+responsePDC.data.titular.cpf
                return res.status(422).send(await buscarDescricaoErro(req, msg.GC14))
            }
        } catch (error) {
            console.error('Erro na API PDC Consultar Consentimento', error);
            if (error.response && error.response.status) {
                switch (error.response.status) {
                    case 400:
                    case 404:
                        return res.status(400).send(error.response.data);
                    case 500:
                        return res.sendStatus(503);
                    default:
                        return res.sendStatus(500);
                }
            } else {
                return res.sendStatus(500);
            }
        }
        try {
            const responseSenatran = await veiculosBasicaProprietarioPlaca(req, cpf, placa);
            if (responseSenatran.data == undefined || responseSenatran.data.veiculo[0] == undefined){
                req.local.message.observacao = "CPF informado: "+ cpf
                return res.status(422).send(await buscarDescricaoErro(req, msg.GC10))
            }
            let dados = [];
            let senatranResult = responseSenatran.data.veiculo[0];
            let dataMetadados = dataConsentimento[0].json_template_consentimento.metadados
            for (let key in senatranResult) {
                const metadado = dataMetadados.find(row => (row.identificador == key));
                if (metadado) {
                    dados.push({
                        identificador: metadado.identificador,
                        chave: metadado.rotulo,
                        descricao: metadado.descricao,
                        valor: await encryptStringWithPublicKeyX509(req, res, senatranResult[key], dataConsentimento[0].chave_publica_cliente, 
                             dataConsentimento[0].cnpj_cliente, dataConsentimento[0].id_habilitacao)
                    })
                }
            }
            let responsePDC = null;
            try {
                //registrar tratamento
                let metadadosTratado = [];
                for (let i = 0; i < dados.length; i++) {
                    metadadosTratado.push(dados[i].identificador);
                }
                responsePDC = await pdcRegistrarTratamento(req, dataConsentimento[0].cnpj_cliente, cpf, new Date().toISOString(), dataConsentimento[0].id_template_tratamento, "", metadadosTratado);
                req.local.message.idRegistroTratamento = responsePDC.data;
            } catch (error) {
                console.error('Erro na API PDC Registrar Tratamento', error);
                if (error.response && error.response.status) {
                    switch (error.response.status) {
                        case 400:
                        case 404:
                            return res.status(400).send(error.response.data);
                        case 500:
                            return res.sendStatus(503);
                        default:
                            return res.sendStatus(500);
                    }
                } else {
                    return res.sendStatus(500);
                }
            }
            res.status(200).json({ dados })
        } catch (error) {
            console.error('Erro na API Consulta Senatran Veículos Proprietário por Placa ', error);
            if (error.response && error.response.status) {
                switch (error.response.status) {
                    case 400:
                        return res.status(400).send(error.response.data);
                    case 404:
                        // req.local.message.observacao = "CPF "+cpf+" não encontrado na Consulta Senatran Veículos Proprietário por Placa: "+ placa;
                        req.local.message.observacao =  `Placa ${placa} não encontrado na Consulta Senatran Veículos Proprietário por Placa`;
                        return res.status(422).send(await buscarDescricaoErro(req, msg.GC50))
                    case 500:
                        return res.sendStatus(503);
                    default:
                        return res.sendStatus(500);
                }
            } else {
                return res.sendStatus(500);
            }
        }
    })
    app.post('/v1/senatran/condutores/descriptografar/', async (req, res) => {
        /*
        #swagger.security = [{
            "bearerAuth": []
        }]
        */
       
        try {
            const encryptText = req.body.encryptText;
            if (encryptText != undefined && encryptText.length > 0) {
                let decryptText = decryptStringWithPrivateKey(encryptText);
                return res.status(200).send(decryptText);
            }else{
                return res.status(404).send("Texto inválido")
            }
        } catch (error) {
            console.error('Erro no descriptografar', error);
            if (error.response && error.response.status) {
                switch (error.response.status) {
                    case 400:
                        return res.status(error.response.status).send(error.response.data);
                    case 500:
                        return res.sendStatus(503);
                    default:
                        return res.sendStatus(500);
                }
            } else {
                return res.sendStatus(500);
            }
        }
    })
}