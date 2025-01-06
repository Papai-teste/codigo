'use strict';

module.exports = function (app) {
  /*
    #swagger.path = '/v1/consentimento/consultar/{idConsentimento}'
    #swagger.parameters['idConsentimento'] = { 
        in: 'path',
        description: "ID do consentimento a ser consultado",
        required: true
    }

    #swagger.security = [{
        "bearerAuth": []
    }]

    #swagger.responses[200] = { 
      description: 'Consulta realizada com sucesso.', 
      schema: {
        "id": "62be0d8a7c1e0f19b33639e5",
        "idTemplateConsentimento": "e2e070f9-05d1-4d06-b51a-883f4056156a",
        "CNPJ": "33683111000107",
        "razaoSocial": "SERPRO",
        "CPF": "61079888071",
        "urlRetorno": "http://localhost:8080",
        "dataHoraSolicitacao": "2022-07-11T18:01:58.774-03:00",
        "dataExpiracao": "2022-12-31T00:00:00-03:00",
        "finalidade": "Boleto Bancário",
        "consequenciaRevogacao": "Bloqueio da conta bancária",
        "metadados": [
          {
            "descricao": "Data de nascimento do condutor",
            "identificador": "dataNascimento",
            "rotulo": "Data de Nascimento",
            "sensivel": false
          },
          {
            "descricao": "Nome do condutor",
            "identificador": "nomeContribuinte",
            "rotulo": "Nome do condutor",
            "sensivel": false
          }
        ],
        "status": "ATIVO"
      }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[404] = { description: 'Registro não encontrado na base' }
    #swagger.responses[422] = { description: 'Unprocessable Entity' }
    #swagger.responses[429] = { description: 'Too Many Requests' }
    #swagger.responses[500] = { description: 'Internal Server Error' }
    #swagger.responses[502] = { description: 'Erro em alguma das APIs consumidas pelo GaaP' }
  */
};
