'use strict';

module.exports = function isMaioridade(dataNascimento) {
  if (!dataNascimento || dataNascimento.length !== 8) {
    return false;
  }

  const hoje = new Date();
  const dia = dataNascimento.substring(0, 2);
  const mes = dataNascimento.substring(2, 4);
  const ano = dataNascimento.substring(4, 8);
  const nascimento = new Date(`${ano}-${mes}-${dia}`);

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesDiferenca = hoje.getMonth() - nascimento.getMonth();

  if (mesDiferenca < 0 || (mesDiferenca === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade >= 18;
};
