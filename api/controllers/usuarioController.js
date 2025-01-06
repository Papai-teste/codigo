'use strict';

const fs = require('fs');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const config = require('../../config');
const isValidCPF = require('../../utils/isValidCPF');
const { buscarSelo } = require('../../requests/apiConfiabilidades');
const { buscarFoto, buscarChavePublica } = require('../../requests/acessoGov');
const buscarDescricaoErro = require('../../utils/buscarDescricaoErro');
const msg = require('../../db/listaErros');
const { isValidLogin } = require('../validations/usuarioValidation');

const privateKey = fs.readFileSync(`${config.SECURITY_PATH_KEY}private_gaap.key`);
const signOptions = { algorithm: 'RS256' };
const keyOptions = {
  key: privateKey,
  passphrase: config.PASS_PRIVATE_KEY,
};
const iss = config.JWT_ISS;
const aud = config.JWT_AUD;

/**
 * Função para verificar o token idToken do ACESSOgov.
 */
async function verificarToken(idToken, chavePublicaAcesso) {
  return jwt.verify(idToken, jwkToPem(chavePublicaAcesso), {
    algorithms: ['RS256'],
    issuer: iss,
    audience: aud,
  });
}

/**
 * Função interna para extrair dados do token (cpf, nome) após verificação.
 * Caso haja erro, já envia a resposta usando res.
 */
async function extrairDadosDoToken(req, res, idToken, chavePublicaAcesso) {
  let decoded;
  try {
    decoded = await verificarToken(idToken, chavePublicaAcesso);
  } catch (error) {
    throw new Error(msg.GC22);
  }

  const cpf = decoded['preferred_username'];
  
  const nome = decoded['name'];

  if (!cpf || !nome) {
    throw new Error(msg.GC22);
  }
  if (!isValidCPF(cpf)){
    throw new Error(msg.GC05);
  }
  return { cpf, nome };
}

/**
 * Função para montar o token JWT local.
 */
function montarToken({ cpf, nome, selo }) {
  const exp = Math.floor(Date.now() / 1000) + (parseInt(config.JWT_EXP_IN_MINUTES, 10) * 60);
  const tokenPayload = { cpf, nome, selo, exp, iss, aud };
  return jwt.sign(tokenPayload, keyOptions, signOptions);
}

/**
 * Função principal de login do usuário
 */
async function login(req, res) {
  try {
    const { ip, idToken, accessToken } = await isValidLogin(req);
    // Buscar chave pública do ACESSOgov
    const chavePublicaAcesso = await buscarChavePublica(req);
    // Extrair dados do token (cpf, nome)
    const { cpf, nome } = await extrairDadosDoToken(req, res, idToken, chavePublicaAcesso);
    // Buscar selo
    const selo = await buscarSelo(req, cpf, ip, accessToken);
    // Montar token JWT
    const token = await montarToken({ cpf, nome, selo });
    // Buscar foto
    const foto = await buscarFoto(req, accessToken, ip);
    // Montar resposta
    const dadosUsuario = { token, selo, foto };
    return res.status(200).json(dadosUsuario);
  } catch (error) {
    console.error('Erro no login:', error);
    if (error && error.message) {
      return res.status(422).send(await buscarDescricaoErro(req, error.message));
    }
    return res.sendStatus(500);
  }
}

module.exports = {
  login,
  verificarToken,
  montarToken,
};
