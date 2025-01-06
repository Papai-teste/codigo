'use strict';

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

module.exports = function (app) {
  // Login
  app.post('/v1/usuario/login/', usuarioController.login);
};
