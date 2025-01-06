'use strict';

const { pdcConsultarConsentimento, pdcRegistrarTratamento} = require('../../../requests/pdc');
const { infracoesPorCPF } = require('../../../requests/senatran');
const { selectConsent } = require('../../../data/consentimento');
const { selectAcao } = require('../../../data/acao');
const { selectTipoErro } = require('../../../data/tipoErro');
const { isValidCPF } = require('../../../utils/isValidCPF');
const config = require('../../../config')
const { encryptStringWithPublicKeyX509 } = require('../../../security/encrypt');
const { decryptStringWithPrivateKey } = require('../../../security/decrypt');
const { isAuthenticated } = require('../../../filter/auth')
const msg = require('../../../db/listaErros');
const acao = require('../../../db/listaAcao');

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
    app.get('/v1/senatran/infracoes/cpf/:cpf', isAuthenticated, async (req, res) => {
        /*
        #swagger.parameters['cpf'] = { 
            in: 'path',
            description: "CPF a ser consultado no SENATRAN",
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
                                    schema: { "dados": { "infracoes": [ { "identificador": "descricaoInfracao", "chave": "Descriçãodainfração", "descricao": "Descriçãodainfração", "valor": "OKpMh4Inzl6hZUIvtpU9wFClMzHQwTezItMEfreLlc72JQySv2ls3P" }, { "identificador": "codigoRenainf", "chave": "CódigoRenafinf", "descricao": "CódigoRenafinf", "valor": "CCUtiY4wilpOpyRlpeSxO922H3VDSOsMWxfEAyEVkFxvcwFjzppWqjJsqHoqsu80Dgiyu127byQ/Ae7oVj3W3MeUwsYBleQhUb7xoPcGva7zLMKRaERn7ij8T9" }, { "identificador": "ufOrgaoAutuador", "chave": "UFdoOrgãoAutuador", "descricao": "UFdoOrgãoAutuador", "valor": "YjNG3uyb5nScO0PTVe2VlJQJqNmTjkclyFmpFXRbiCP/" }, { "identificador": "placa", "chave": "Placadoveículo", "descricao": "Placadoveículo", "valor": "qUXQzxXChSD7qpxBrNOgK/" }, { "identificador": "codigoRenavam", "chave": "Códigodorenavam", "descricao": "Códigodorenavam", "valor": "HTqlIBJiPmulCcl/ebh7Fyep5hnJKLT+jw6OT8t+qZNV7m4IZjKeqymKCTJs1da3WSq3U9xPNsO" }, { "identificador": "descricaoMarcaModelo", "chave": "Descriçãodamarcaedomodelo", "descricao": "Descriçãodamarcaedomodelo", "valor": "ZUdQtqAgMyRyuPx9KKNsq1tOvfWrT6FKrW/TP1aOGzf/" }, { "identificador": "descricaoCorVeiculo", "chave": "Descriçãodadordoveículo", "descricao": "Descriçãodadordoveículo", "valor": "TgzFUOHg7FZMcyxg3epNRyH+ja97rgKBmiqD3ZzapVhGqR++yCdeKaFGEDRxoNEN8R4l4mcCtROIUeIlRbJMQWD+b2B/" }, { "identificador": "descricaoOrgaoAutuador", "chave": "DescriçãodoOrgãoAutuador", "descricao": "DescriçãodoOrgãoAutuador", "valor": "Tji71niJY1J9oJczHm7rxU0l4t30s7bxecwDgFpIa5VJGh6/QaF/qWPRB2SEPYQ0Wiw6inawhu3DRWSkl7y/ySD3Z3x9t/4R0UgaHyT0h5YcEfUiwDK2s/" }, { "identificador": "numeroAutoInfracao", "chave": "Númerodainfração", "descricao": "Númerodainfração", "valor": "WbpMru2ceYuzkCFKHQlNBE+Y9kZCBhjGR6y241cd1EDEJKvvjfgTbMJQ5tN" }, { "identificador": "dataInfracao", "chave": "DatadaInfração", "descricao": "DatadaInfração", "valor": "APgUFqafDusxJRfCIuj+/fInQCe9YoR2KsoYvou6nphO5iezAJFsbGJXFJQWNRnHfx9Yxa7HqssnE76jKngJ66YzQemX17Dn1LtAIuFri3HAXLcR+bmDuhn2vML" }, { "identificador": "horaInfracao", "chave": "Horadainfração", "descricao": "Horadainfração", "valor": "ACkqoysQHs6wlp/ZuWPk/Wn9pqQ8yPbIGFcnNE/zv0vw+M15gp9ceEPLgbFtTyB+Le3bSUKUesYk7OTXc" }, { "identificador": "localOcorrenciaInfracao", "chave": "Localdaocorrênciadainfração", "descricao": "Localdaocorrênciadainfração", "valor": "Nleokc2oczzvrgc4fbJPk4vcxiaVMyhme8jfFgEgg+Nc+YWVQA9FDlF9lYg9yRZoyJTVWr8MMR9J/74QfHqPIujVmISquZQyqqYqSaaKVeR4EDZ3z8XInkw/" }, { "identificador": "descricaoMunicipioInfracao", "chave": "Descriçãodomunicípiodainfração", "descricao": "Descriçãodomunicípiodainfração", "valor": "FJx74o31kkZJlwzVE/N1rmc8gIlmldwmPsjF8edZ1OffNEOFu+pZZi4/TqM+L9aWrJbSWXA/KdhiEqd+M91+OZUvL0rapgXJt4di+iOkVx8/5pfHov8FZA" }, { "identificador": "medicaoReal", "chave": "Mediçãoreal", "descricao": "Mediçãoreal", "valor": "Y4tzAhmBbqbRz5DSYE+2iWqpfii9T29Em5J4M" }, { "identificador": "limitePermitido", "chave": "Limitepermitido", "descricao": "LimitePermitido", "valor": "UaA/ITAZPlBuqNXO1KlbOJish+8Vaj6FZFxqoovN63LR4GCa1Dy97kBp1CJG7VR" }, { "identificador": "medicaoConsiderada", "chave": "MediçãoConsiderada", "descricao": "MediçãoConsiderada", "valor": "PP9K3CprziSaVMTHhYcV4IRVuksRb8GlpYlE/POhd14AmQNWNGoo1zE/wqWM0rrf+tq2d" }, { "identificador": "descricaoUnidadeMedida", "chave": "DescriçãoUnidadedeMedida", "descricao": "DescriçãoUnidadedeMedida", "valor": "pcDJZkPmNM1tlQRRqv423o0XqfT12lUEnxJMuKU7dbDgITMgEf1uAtEpTemwH" }, { "identificador": "valorIntegralInfracao", "chave": "ValorintegraldaInfração", "descricao": "ValorintegraldaInfração", "valor": "PHLZM8NJvcgR/XZxLtQFCgV2/GsnLJd6alfEKU1IPEEVPRjaHPPs9bRbBC+2n9QqMXWVv99QwYUiY8LvZfLv01S5Z" }, { "identificador": "dataEmissaoNotificacaoAutuacao", "chave": "Dataemissãodaautuação", "descricao": "Dataemissãodaautuação", "valor": "Z0kmJ8jykxvkF8WvHRnwAzIeocZRw7mOSZQopaLx3r273E4Y5TK5YY0wIyLeKKnzh" }, { "identificador": "dataLimiteDefesaAutuacao", "chave": "Datalimitedefesadaautuação", "descricao": "Datalimitedefesadaautuação", "valor": "IyHR9fjMa1FuAGmSyvkmE7gQc8WTmGnhWQ+bkuj6+i+62HhpBDDQfMcckp9QYm/" }, { "identificador": "dataEmissaoNotificacaoPenalidade", "chave": "Dataemissãodanotificação", "descricao": "Dataemissãodanotificação", "valor": "XJ+DV7SZTZSOynN+LxmvGPU4BdsVPrgOlXngaR9LMB3HO+jMzEf3v1dSn54A" }, { "identificador": "descricaoPenalidade", "chave": "Descriçãodapenalidade", "descricao": "Descriçãodapenalidade", "valor": "qw0iQcHyAVfY1Zuc6ANpRweYH0vJS/dxCGFtK8ehumERqUtaVQ1vw6P3Vj" }, { "identificador": "nomeRealInfrator", "chave": "Nomerealdoinfrator", "descricao": "Nomerealdoinfrator", "valor": "qCiXe2T99u5KFkAkgwEZJBxIZVxsVb1SxKOTsYdQmlAUYSuG7Q7rVNl2NVOnbqJ2l" }, { "identificador": "descricaoIndicadorExigibilidade", "chave": "Descriçãoindicadordeexigibilidade", "descricao": "Descriçãoindicadordeexigibilidade", "valor": "kwIWmT7VNzLE3HCD+HTLD4rwWwb5+B6J+tGi7iUD1pY7XrMiJYwZMyGE9+pU/VNDqnCTg4fAtNDbWyj5Lg4V7HRy0YVdEAAnyYegX841RmeCOIfZxjDA9+yAh8dDtj" }] }}
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
        console.log("Consulta Infrações 1")
        const idConsentimento = req.header('id-consentimento');
        console.log("Consulta Infrações 2")
        const cnpjCliente = req.local.cnpj;
        console.log("Consulta Infrações 3")
        req.local.message.idAcao = await buscarAcao(acao.SEN_INFRA_CPF);
        console.log("Consulta Infrações 4")
        req.local.message.idConsentimento = idConsentimento;
        console.log("Consulta Infrações 5")
        //valida CPF
        if (await isValidCPF(cpf) == false){
            console.log("Consulta Infrações 6")
            req.local.message.observacao = "CPF: "+ cpf
            return res.status(422).send(await buscarDescricaoErro(req, msg.GC05))
        }
        //valida consentimento
        if (idConsentimento == undefined || idConsentimento == null ||
            idConsentimento.length == 0 || idConsentimento.length > 24){
                console.log("Consulta Infrações 7")
            req.local.message.observacao = "Consentimento: "+ idConsentimento
            req.local.message.idConsentimento = undefined
            return res.status(422).send(await buscarDescricaoErro(req, msg.GC07))
        }
        console.log('idConsentimento: '+idConsentimento)
        const dataConsentimento = await selectConsent(idConsentimento);
        console.log("Consulta Infrações 8")
        //verificar se a URL informada pertence a API
        if (config.CHECK_TOKEN_WSO2.localeCompare("true") == 0 &&
            req.local.idApi != dataConsentimento[0].codigo_api) {
                console.log("Consulta Infrações 9")
            req.local.message.observacao = "Código da API informado no JWT: "+ req.local.idApi + " Código da API do consentimento informado: "+dataConsentimento[0].codigo_api
            return res.status(422).send(await buscarDescricaoErro(req, msg.GC28))
        }
        if (dataConsentimento.length == 0) {
            console.log("Consulta Infrações 10")
            req.local.message.observacao = "Consentimento: "+ idConsentimento
            req.local.message.idConsentimento = undefined
            return res.status(422).send(await buscarDescricaoErro(req, msg.GC04))
        }
        if (dataConsentimento[0].cnpj_cliente != cnpjCliente) {
            console.log("Consulta Infrações 11")
            req.local.message.observacao = "CNPJ do cliente informado: "+ cnpjCliente + " CNPJ do template do consentimento cadastrado: "+dataTemplateApi[0].cnpj_cliente
            return res.status(422).send(await buscarDescricaoErro(req, msg.GC02))
        }
        if (dataConsentimento[0].cpf_cidadao != cpf) {
            console.log("Consulta Infrações 12")
            req.local.message.observacao = "CPF informado: "+ cpf + " CPF do consentimento cadastrado: "+dataConsentimento[0].cpf_cidadao
            return res.status(422).send(await buscarDescricaoErro(req, msg.GC14))
        }
        let responsePDC = null;
        try {
            console.log("Consulta Infrações 13")
            responsePDC = await pdcConsultarConsentimento(req, idConsentimento);
            //valida consentimento
            if (responsePDC.data.status != "ATIVO") {
                console.log("Consulta Infrações 14")
                req.local.message.observacao = "Status Consentimento: "+ responsePDC.data.status
                return res.status(422).send(await buscarDescricaoErro(req, msg.GC15))
            }
            if (responsePDC.data.titular.cpf != cpf) {
                console.log("Consulta Infrações 15")
                req.local.message.observacao = "CPF informado: "+ cpf + " CPF do consentimento no PDC: "+responsePDC.data.titular.cpf
                return res.status(422).send(await buscarDescricaoErro(req, msg.GC14))
            }
        } catch (error) {
            console.log("Consulta Infrações 16")
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
            console.log("Consulta Infrações 17")
            const responseSenatran = await infracoesPorCPF(req, cpf);
            if (responseSenatran.data == undefined){
                console.log("Consulta Infrações 18")
                req.local.message.observacao = "CPF informado: "+ cpf
                return res.status(404).send(await buscarDescricaoErro(req, msg.GC50))
            }
            console.log("Consulta Infrações 19")
            let senatranResult = responseSenatran.data.infracoes;
            console.log("Consulta Infrações 20")
            let dataMetadados = dataConsentimento[0].json_template_consentimento.metadados
            console.log("Consulta Infrações 21")
            let dados = new Array();   
            console.log("Consulta Infrações 22")
            for (var i = 0; i < senatranResult.length; i++){
                console.log("Consulta Infrações 23")
                let infracao = new Array();
                let j = 0;

                for (let key in senatranResult[i]) {
                    console.log("Consulta Infrações 24")
                    const metadado = dataMetadados.find(row => (row.identificador == key));
                    if (metadado) {
                        let valor = (senatranResult[i])[key];
                        try {
                            infracao[j] = ({
                                identificador: metadado.identificador,
                                chave: metadado.rotulo,
                                descricao: metadado.descricao,
                                valor: await encryptStringWithPublicKeyX509(valor, dataConsentimento[0].chave_publica_cliente)
                            })
                        } catch (error) {
                            req.local.message.observacao = "Chave pública informada no credenciamento: "+ dataConsentimento[0].chave_publica_cliente
                            return res.status(422).send(await buscarDescricaoErro(req, msg.GC56))
                        }
                        j = j +1;
                    }
                }
                dados[i] = infracao;
            }
            let responsePDC = null;
            console.log("Consulta Infrações 25")
            try {
                //registrar tratamento
                let metadadosTratado = [];
                console.log("Consulta Infrações 26")
                if(dados.length > 0){
                    let infracao = dados[0];
                    console.log("Consulta Infrações 27")
                    for (let i = 0; i < infracao.length; i++) {
                        metadadosTratado.push(infracao[i]["identificador"]);
                    }
                    responsePDC = await pdcRegistrarTratamento(req, dataConsentimento[0].cnpj_cliente, cpf, new Date().toISOString(), dataConsentimento[0].id_template_tratamento, "", metadadosTratado);
                    req.local.message.idRegistroTratamento = responsePDC.data;
                }
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
            res.header("x-apim-bill-data", '{"insumo-prefixo": "GAAP", "insumo-radical": "SENATRAN", "insumo-sufixo": "CONSULTADETALHADA"}');
            res.status(200).json({ dados })
        } catch (error) {
            console.error('Erro na API Consulta Senatran Infrações por CPF ', error);
            if (error.response && error.response.status) {
                switch (error.response.status) {
                    case 400:
                        return res.status(400).send(error.response.data);
                    case 404:
                        req.local.message.observacao =  `CPF ${cpf} não encontrado na Consulta Senatran Infrações por CPF`;
                        return res.status(404).send(await buscarDescricaoErro(req, msg.GC50))
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