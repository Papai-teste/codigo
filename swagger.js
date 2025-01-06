const swaggerAutogen = require('swagger-autogen')({ openapi: "3.0.0" })

const outputFile = 'src/openapi.json'
const endpointsFiles = ['./src/api/senatran/infracoes/cpf.js','./src/api/routes/consentimentoRoutes.js']

const doc = {
  info: {
    title: "GaaP",
    description: "Gestor de consentimento de APIs de governo"
  },
  security: [{"bearerAuth": []}],
  securityDefinitions: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer'
    }
  },
  components:{
    '@schemas': {
      bodyConsentimento:{
        type:'object',
        properties:{
          idTemplate:{
            type:'string',
            example:'a3959898-193b-4894-8381-2d1700678855'
          },
          urlRetorno:{
            type:'string',
            example:'http://exemplos.com.br'
          },
          dataExpiracao:{
            type:'string',
            example:'2045-12-31T03:00:00.000Z'
          }
        }
      }
    }
  },
  definitions: {},
  host: "d-api-gaap-gestor.estaleiro.serpro.gov.br/api",
  schemes: ['https']
}

// swaggerAutogen(outputFile, endpointsFiles, doc);

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  // eslint-disable-next-line global-require, import/no-useless-path-segments, import/extensions
  require('../src/index.js'); // Your project's root file
});