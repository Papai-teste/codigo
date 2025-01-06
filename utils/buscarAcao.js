'use strict';

const { selectAcao } = require('../data/acao');
const msg = require("../db/listaErros")

module.exports = async function buscarAcao(sigla) {
  const resultadoAcao = await selectAcao(sigla);
  if (!resultadoAcao || resultadoAcao.length === 0) {
    throw new Error(msg.GC61);
  }
  return resultadoAcao[0].id_acao;
};