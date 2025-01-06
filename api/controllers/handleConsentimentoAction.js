'use strict';

const { selectConsent } = require('../../data/consentimento');
const buscarDescricaoErro = require('../../utils/buscarDescricaoErro');
const buscarAcao = require('../../utils/buscarAcao');
const msg = require('../../db/listaErros');

module.exports = async function handleConsentimentoAction(req, res, actionFunction, actionSigla, successStatusCode = 204) {
  try {
    const idConsentimento = req.params.idConsentimento;
    req.local.message.idAcao = await buscarAcao(actionSigla);

    if (!idConsentimento || idConsentimento.length > 24) {
      req.local.message.observacao = `ID Consentimento: ${idConsentimento}`;
      req.local.message.idConsentimento = undefined;
      throw new Error(msg.GC07)
    }

    const dataConsentimento = await selectConsent(idConsentimento);

    if (!dataConsentimento || dataConsentimento.length === 0) {
      req.local.message.observacao = `ID Consentimento: ${idConsentimento}`;
      req.local.message.idConsentimento = undefined;
      throw new Error(msg.GC04)
    }

    req.local.message.idConsentimento = idConsentimento;
    const cpfToken = req.local.cpf;

    if (cpfToken && cpfToken !== dataConsentimento[0].cpf_cidadao) {
      req.local.message.observacao = `CPF extraído no JWT: ${cpfToken} diferente do CPF do titular cadastrado.`;
      throw new Error(msg.GC14)
    }

    await actionFunction(req, dataConsentimento[0].cpf_cidadao, idConsentimento);
    return res.sendStatus(successStatusCode);

  } catch (error) {
    console.error('Erro no negar, aprovar ou revogar consentimento', error.request);
    if (error && error.message) {
      return res.status(422).send(await buscarDescricaoErro(req, error.message));
    }
    return res.sendStatus(500);
  }
};
