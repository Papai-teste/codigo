'use strict';

const { selectTemplateApi } = require('../../data/templateApi');
const { selectConsent } = require('../../data/consentimento');
const { pdcConsultarConsentimento, pdcSolicitarConsentimento, pdcAprovarConsentimento, pdcNegarConsentimento, pdcRevogarConsentimento } = require('../../requests/pdc');
const msg = require('../../db/listaErros');
const acao = require('../../db/listaAcao');
const buscarDescricaoErro = require('../../utils/buscarDescricaoErro');
const buscarAcao = require('../../utils/buscarAcao');
const handleConsentimentoAction = require('./handleConsentimentoAction');

// validações
const { validarSolicitacao, validarTemplateApiDados } = require('../validations/solicitarConsentimentoValidation');
const validarConsulta = require('../validations/consultarConsentimentoValidation');

exports.solicitarConsentimento = async function(req, res) {
  try {
    const cnpjCliente = req.local.cnpj;
    const cpf = req.params.cpf;
    const { idTemplate, dataExpiracao, urlRetorno } = req.body;

    req.local.message.idAcao = await buscarAcao(acao.SOL_CONS);

    await validarSolicitacao(req, res, buscarDescricaoErro, msg);

    req.local.message.consentimento = {
      cnpjCliente,
      cpf,
      idTemplate,
      urlRetorno,
      dataExpiracao,
    };

    const dataTemplateApi = await selectTemplateApi(idTemplate);

    await validarTemplateApiDados(req, res, dataTemplateApi, cpf, cnpjCliente, buscarDescricaoErro, msg);
    
    // Se passou nas validações, solicita consentimento no PDC
    const response = await pdcSolicitarConsentimento(req, cnpjCliente, cpf, idTemplate, dataExpiracao);
    const idConsentimento = response.data[0];
    req.local.message.consentimento.idConsentimento = idConsentimento;

    return res.status(200).json({ idConsentimento });
  } catch (error) {
    console.error('Erro na solicitação do consentimento', error);
    if (error && error.message) {
      return res.status(422).send(await buscarDescricaoErro(req, error.message));
    }
    return res.sendStatus(500);
  }
};

exports.consultarConsentimento = async function(req, res) {
  try {
    const cpfToken = req.local.cpf;
    const idConsentimento = req.params.idConsentimento;

    req.local.message.idAcao = await buscarAcao(acao.CON_CONS);

    await validarConsulta(req, res, buscarDescricaoErro, msg);
    const dataConsentimento = await selectConsent(idConsentimento);

    if (!dataConsentimento || dataConsentimento.length === 0) {
      req.local.message.observacao = `ID Consentimento: ${idConsentimento}`;
      throw new Error(msg.GC04)
    }

    req.local.message.idConsentimento = idConsentimento;

    const pdcResponse = await pdcConsultarConsentimento(req, idConsentimento);
    const pdcData = pdcResponse.data;

    if (cpfToken && cpfToken != pdcData.titular.cpf) {
      req.local.message.observacao = `CPF extraído no JWT: ${cpfToken} diferente do CPF do titular no PDC: ${pdcData.titular.cpf}`;
      throw new Error(msg.GC14)
    }

    return res.status(200).json({
      id: pdcData.id,
      idTemplateConsentimento: pdcData.idConsentimentoTemplate,
      dataHoraSolicitacao: pdcData.dataHora,
      dataExpiracao: pdcData.dataExpiracao,
      cpf: pdcData.titular.cpf,
      status: pdcData.status,
      categoria: pdcData.categoria,
      finalidade: pdcData.finalidade,
      consequenciaRevogacao: pdcData.consequenciaRevogacao,
      infoCompartilhamentoDeDados: pdcData.infoCompartilhamentoDeDados,
      duvidasReclamacoes: dataConsentimento[0].duvidas_reclamacoes,
      baseLegal: dataConsentimento[0].base_legal,
      CNPJ: dataConsentimento[0].cnpj_cliente,
      razaoSocial: dataConsentimento[0].nome_cliente,
      urlRetorno: dataConsentimento[0].url_retorno,
    });
  } catch (error) {
    console.error('Erro na consulta do consentimento', error);
    if (error && error.message) {
      return res.status(422).send(await buscarDescricaoErro(req, error.message));
    }
    return res.sendStatus(500);
  }
};

// Aprovar
exports.aprovarConsentimento = (req, res) =>
  handleConsentimentoAction(req, res, pdcAprovarConsentimento, acao.APR_CONS);

// Negar
exports.negarConsentimento = (req, res) =>
  handleConsentimentoAction(req, res, pdcNegarConsentimento, acao.REV_CONS);

// Revogar
exports.revogarConsentimento = (req, res) =>
  handleConsentimentoAction(req, res, pdcRevogarConsentimento, acao.REV_CONS);
