module.exports = function isValidCPF(cpf) {
  var Soma = 0;
  var Resto;

  // Valida se o CPF contém apenas números antes de qualquer limpeza
  if (!/^\d{11}$/.test(String(cpf))) {
      return false;
  }

  // Remove caracteres não numéricos (se necessário)
  var strCPF = String(cpf).replace(/[^\d]/g, '');

  // Valida se o CPF tem exatamente 11 dígitos
  if (strCPF.length !== 11) {
      return false;
  }

  // Rejeita CPFs conhecidos como inválidos
  if ([
      '00000000000',
      '11111111111',
      '22222222222',
      '33333333333',
      '44444444444',
      '55555555555',
      '66666666666',
      '77777777777',
      '88888888888',
      '99999999999'
  ].includes(strCPF)) {
      return false;
  }

  // Validação do primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
      Soma += parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  }

  Resto = (Soma * 10) % 11;

  if (Resto === 10 || Resto === 11) {
      Resto = 0;
  }

  if (Resto !== parseInt(strCPF.substring(9, 10))) {
      return false;
  }

  Soma = 0;

  // Validação do segundo dígito verificador
  for (let i = 1; i <= 10; i++) {
      Soma += parseInt(strCPF.substring(i - 1, i)) * (12 - i);
  }

  Resto = (Soma * 10) % 11;

  if (Resto === 10 || Resto === 11) {
      Resto = 0;
  }

  if (Resto !== parseInt(strCPF.substring(10, 11))) {
      return false;
  }

  return true;
};
