'use strict';

const isValidURL = require('../../utils/isValidURL');
const isValidCPF = require('../../utils/isValidCPF');
const isMaioridade = require('../../utils/isMaioridade');
const { consultarCPF } = require('../../requests/consultaCPF');
const config = require('../../config');

module.exports = {
  validarSolicitacao: async function(req, res, buscarDescricaoErro, msg) {
    const { idTemplate, urlRetorno, dataExpiracao } = req.body;
    const cpf = req.params.cpf;

    if (!idTemplate || idTemplate.length > 36) {
      req.local.message.observacao = `ID template do consentimento: ${idTemplate}`;
      req.local.message.idTemplate = undefined;
      throw new Error(msg.GC09);
    }
    
    if (!(await isValidCPF(cpf))) {
      req.local.message.observacao = `CPF: ${cpf}`;
      throw new Error(msg.GC05);
    }

    if (!dataExpiracao || isNaN(new Date(dataExpiracao).getTime())) {
      req.local.message.observacao = `Data Expiração: ${dataExpiracao}`;
      throw new Error(msg.GC08);
    }

    if (!urlRetorno || urlRetorno.length > 600 || !isValidURL(urlRetorno)) {
      req.local.message.observacao = `URL Retorno: ${urlRetorno}`;
      throw new Error(msg.GC11);
    }
  },

  validarTemplateApiDados: async function(req, res, dataTemplateApi, cpf, cnpjCliente, buscarDescricaoErro, msg) {
    if (!dataTemplateApi || dataTemplateApi.length === 0) {
      req.local.message.observacao = `Id Template do consentimento não encontrado: ${req.body.idTemplate}`;
      throw new Error(msg.GC01);
    }

    if (dataTemplateApi[0].status_api !== 'A') {
      req.local.message.observacao = `Status da API: ${dataTemplateApi[0].status_api}`;
      throw new Error(msg.GC27);
    }

    if (config.CHECK_TOKEN_WSO2 === 'true' && req.local.idApi !== dataTemplateApi[0].codigo_api) {
      req.local.message.observacao = `Código da API informado no JWT: ${req.local.idApi} Código da API do template do consentimento informado: ${dataTemplateApi[0].codigo_api}`;
      throw new Error(msg.GC28);
    }

    const responseCpf = await consultarCPF(req, cpf);
    if (!isMaioridade(responseCpf.data.nascimento)) {
      req.local.message.observacao = `Data nascimento: ${responseCpf.data.nascimento}`;
      throw new Error(msg.GC18);
    }

    const codigoApi = dataTemplateApi[0].codigo_api;
    req.local.message.consentimento.codigoApi = codigoApi;

    if (dataTemplateApi[0].cnpj_cliente !== cnpjCliente) {
      req.local.message.observacao = `CNPJ do cliente informado: ${cnpjCliente} CNPJ do template do consentimento cadastrado: ${dataTemplateApi[0].cnpj_cliente}`;
      throw new Error(msg.GC02);
    }
  }
};
