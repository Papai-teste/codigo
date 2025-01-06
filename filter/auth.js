const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const config = require('../config');
const crypto = require('crypto');
const { selectTipoErro } = require('../data/tipoErro');
const fs = require('fs');
const msg = require('../db/listaErros');
const { selectApiFromURL } = require('../data/api');
const getProxyConfig = require('../utils/proxy');
const buscarDescricaoErro = require('../utils/buscarDescricaoErro');

// Função: Sem autenticação (ambiente local)
async function handleDevLocalAuth(req, res, next) {
  if (process.env.EST_ENVIRONMENT && process.env.EST_ENVIRONMENT.trim() === "devlocal") {
    req.local.cnpj = '33683111000107';
    req.local.idApi = 1;
    return true; // indica que a autenticação foi tratada
  }
  return false; // não é dev local
}

// Função: Autenticação front-end Conecta+
async function handleFrontendAuth(req, res, next) {
  const { authorization } = req.headers;
  const loginPaths = [
    '/v1/consentimento/consultar',
    '/v1/consentimento/revogar',
    '/v1/consentimento/aprovar',
    '/v1/consentimento/negar',
  ];

  const isLoginPath = loginPaths.some((path) => req.originalUrl.includes(path));
  if (!(authorization && authorization.startsWith('Bearer ') && isLoginPath)) {
    return false; 
  }

  const token = authorization.split(' ')[1];
  if (!token) {
    return res.status(401).send(await buscarDescricaoErro(req, msg.GC24));
  }

  const publicKey = fs.readFileSync(`${config.SECURITY_PATH_KEY}public_gaap.pem`);
  let decoded;
  try {
    decoded = jwt.verify(token, publicKey);
  } catch (err) {
    console.error('Erro na verificação do token JWT Front End:', err);
    return res.status(401).send(await buscarDescricaoErro(req, msg.GC57));
  }

  const { exp, iss, aud, cpf } = decoded;
  req.local.cpf = cpf;
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);

  if (currentTimeInSeconds >= exp)
    return res.status(403).send(await buscarDescricaoErro(req, msg.GC25));

  if (iss !== config.JWT_ISS || aud !== config.JWT_AUD)
    return res.status(403).send(await buscarDescricaoErro(req, msg.GC26));

  return true; // autenticação front-end foi bem sucedida
}

// Função: Autenticação do WSO2
async function handleWso2Auth(req, res, next) {
  if (config.CHECK_TOKEN_WSO2.localeCompare("true") !== 0) {
    return false; // não precisa checar WSO2
  }

  const token = req.headers["x-jwt-assertion"];
  if (!token) {
    return res.status(401).send(await buscarDescricaoErro(req, msg.GC24));
  }

  if (!req.app.get('jwks')) {
    const proxy = getProxyConfig();
    const publicKeys = await axios.default.get(config.INTEGRATION_JWKS_WSO2, config.APP_PROXY_USER ? proxy : {});
    req.app.set('jwks', publicKeys.data);
  }

  const jwtParts = token.split('.');
  const header = JSON.parse(Buffer.from(jwtParts[0], 'base64').toString());
  const body = JSON.parse(Buffer.from(jwtParts[1], 'base64').toString());
  const sign = jwtParts[2];

  const jwk = req.app.get('jwks').keys.find(jwk => ((header.alg == jwk.alg) && header.x5t == jwk.kid));
  
  const verifier = crypto.createVerify('sha256');
  verifier.update(jwtParts.slice(0, 2).join('.'));
  
  try {
    if (!verifier.verify(jwkToPem(jwk), sign, 'base64')) {
      console.error('Erro na verificação do token JWT WSO2:');
      return res.status(401).send(await buscarDescricaoErro(req, msg.GC57));
    }
  } catch (err) {
    console.error('Erro na verificação do token JWT WSO2:', err);
    return res.status(401).send(await buscarDescricaoErro(req, msg.GC57));
  }

  req.local.cnpj = body["http://wso2.org/claims/applicationname"];
  req.local.urlApi = body["http://wso2.org/claims/apicontext"];
  const apis = await selectApiFromURL(req.local.urlApi);
  req.local.idApi = JSON.parse(apis[0].codigo_api);

  return true; // autenticação WSO2 foi bem sucedida
}


module.exports.isAuthenticated = async (req, res, next) => {
  try {
    // Primeiro tenta autenticação local (dev)
    if (await handleDevLocalAuth(req, res, next)) return next();

    // Tenta autenticação do front-end
    if (await handleFrontendAuth(req, res, next)) return next();

    // Tenta autenticação do WSO2
    if (await handleWso2Auth(req, res, next)) return next();

    // Se chegou aqui, não houve autenticação válida
    return res.status(401).send(await buscarDescricaoErro(req, msg.GC24));
  } catch (e) {
    console.error('Problemas na autenticação:', e);
    return res.sendStatus(401);
  }
};
