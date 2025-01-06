'use strict';

module.exports = async function validarConsulta(req, res, buscarDescricaoErro, msg) {
  const idConsentimento = req.params.idConsentimento;

  if (!idConsentimento || idConsentimento.length > 24) {
    req.local.message.observacao = `ID Consentimento: ${idConsentimento}`;
    req.local.message.idConsentimento = undefined;
    throw new Error(msg.GC07)
  }
};
