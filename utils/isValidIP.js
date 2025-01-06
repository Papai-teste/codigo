'use strict';
const net = require('net');
const msg = require('../db/listaErros');
const isNonEmptyString = require('./isNonEmptyString');

function isValidIP(ip) {
  if (!isNonEmptyString(ip) || net.isIP(ip.trim()) === 0) {
    throw new Error(msg.GC19);
  }
  return ip.trim();
}

function isValidReqIP(req) {
  const ip = req.header('x-forwarded-for') || req.ip || '';
  return isValidIP(ip);
}

module.exports = { isValidReqIP, isValidIP };
