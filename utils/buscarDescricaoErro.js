'use strict';

const { selectTipoErro } = require('../data/tipoErro');

module.exports = async function buscarDescricaoErro(req, sigla) {
  const erro = await selectTipoErro(sigla);
  if (!erro || erro.length === 0) {
    throw new Error('Tipo de erro não encontrado');
  }
  req.local.message.idTipoErro = erro[0].id_tipo_erro;
  return erro[0].descricao_tipo_erro;
};
