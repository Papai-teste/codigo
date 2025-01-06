'use strict';

const { isAuthenticated } = require('../../filter/auth');
const consentimentoController = require('../controllers/consentimentoController');

const solicitarConsentimentoSwagger = require('./swagger/solicitarConsentimentoSwagger');
const consultarConsentimentoSwagger = require('./swagger/consultarConsentimentoSwagger');
const aprovarConsentimentoSwagger = require('./swagger/aprovarConsentimentoSwagger');
const negarConsentimentoSwagger = require('./swagger/negarConsentimentoSwagger');
const revogarConsentimentoSwagger = require('./swagger/revogarConsentimentoSwagger');

module.exports = function (app) {
  // Solicitar consentimento
  solicitarConsentimentoSwagger(app);
  app.post('/v1/consentimento/solicitar/:cpf', isAuthenticated, consentimentoController.solicitarConsentimento);
  
  // Consultar consentimento
  consultarConsentimentoSwagger(app);
  app.get('/v1/consentimento/consultar/:idConsentimento', isAuthenticated, consentimentoController.consultarConsentimento);

  // Aprovar consentimento
  aprovarConsentimentoSwagger(app);
  app.put('/v1/consentimento/aprovar/:idConsentimento', isAuthenticated, consentimentoController.aprovarConsentimento);

  // Negar consentimento
  negarConsentimentoSwagger(app);
  app.put('/v1/consentimento/negar/:idConsentimento', isAuthenticated, consentimentoController.negarConsentimento);

  // Revogar consentimento
  revogarConsentimentoSwagger(app);
  app.put('/v1/consentimento/revogar/:idConsentimento', isAuthenticated, consentimentoController.revogarConsentimento);
};
