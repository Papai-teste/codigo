'use strict';

module.exports = function isValidURL(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};