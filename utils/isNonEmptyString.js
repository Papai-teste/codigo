'use strict';

module.exports = function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
};