
const { isValidCPF } = require('./isValidCPF');
describe('Teste unitário da função que valida CPF', () => {
  describe('validandoNulos', () => {
    test('Retorna false se passar string vazia',  async() => {
      const isValid = await isValidCPF("");
      expect(isValid).toEqual(false);
    });
    test('Retorna false se passar string com espaços',  async() => {
      const isValid = await isValidCPF(" ");
      expect(isValid).toEqual(false);
    });
    test('Retorna false se passar string com apenas a formatação',  async() => {
      const isValid = await isValidCPF("..-");
      expect(isValid).toEqual(false);
    });
    test('Retorna false se passar string com menos de 11 números',  async() => {
      const isValid = await isValidCPF("00.246.521-30");
      expect(isValid).toEqual(false);
    });
    test('Retorna false se passar string com CPFs padrão',  async() => {
      const isValid = await isValidCPF("00000000000");
      expect(isValid).toEqual(false);
    });
    test('Retorna false se passar CPF inválido',  async() => {
      const isValid = await isValidCPF("00000000001");
      expect(isValid).toEqual(false);
    });
    test('Retorna true se passar CPF válido',  async() => {
      const isValid = await isValidCPF("00024652130");
      expect(isValid).toEqual(true);
    });
  });
});
