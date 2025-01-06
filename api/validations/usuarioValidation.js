'use strict';

const { URL } = require('url');
const msg = require('../../db/listaErros');
const { isValidCode, buscarChavePublica, buscarFoto } = require('../../requests/acessoGov');
const { buscarSelo } = require('../../requests/apiConfiabilidades');
const acao = require('../../db/listaAcao');
const buscarAcao = require('../../utils/buscarAcao');
const {isValidReqIP} = require('../../utils/isValidIP');
const isNonEmptyString = require('../../utils/isNonEmptyString');
const isValidURL = require('../../utils/isValidURL');

/**
 * Funções de validação básicas
 */
function isValidRedirectUri(req) {
  const redirectUri = req.body.redirect_uri;
  if (!redirectUri || !isNonEmptyString(redirectUri) || !isValidURL(redirectUri)) {
    throw new Error(msg.GC23);
  }
  return redirectUri.trim();
}

/**
 * Função que realiza as validações iniciais e busca dados necessários para o login.
 * Caso tudo dê certo, retorna um objeto com { ip, code, redirectUri, idToken, accessToken }.
 */
async function isValidLogin(req) {
  const ip = await isValidReqIP(req);
  const redirectUri = await isValidRedirectUri(req);

  req.local = req.local || {};
  req.local.message = req.local.message || {};
  req.local.message.idAcao = await buscarAcao(acao.LGI_GAAP);

  const respAcesso = await isValidCode(req, req.body.code, redirectUri, ip);
  const { id_token: idToken, access_token: accessToken } = respAcesso.data;
  if (!idToken) {
    throw new Error(msg.GC22);
  }
  return { ip, idToken, accessToken };
}

module.exports = {
  isValidLogin,
  buscarFoto, // se precisar
  buscarSelo, // se precisar
  buscarChavePublica, // se precisar
};
