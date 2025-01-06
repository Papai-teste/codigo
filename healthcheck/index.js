'use strict';

const db = require('../db');

let currentRequests = 0;
let shutdownReceived = false;
module.exports = {
    countRequests: (req, res, next) => {
        if (!req.originalUrl.includes('/healthcheck/')) {
            currentRequests++;
            res.once('finish', () => {
                currentRequests--;
            });
        }
        next();
    },
    readiness: (req, res) => {
        if (shutdownReceived) {
            console.log('api respondendo para ser removida do balanceador');
            return res.status(503).send();
        }
        return res.status(204).send();
    },
    liveness: async (req, res) => {
        const dbValid = await db.isValid();
        if (!dbValid) {
            return res.status(503).send();
        }
        return res.status(204).send();
    },
    shutdown: (req, res) => {
        const clientIP = req.connection.remoteAddress;
        if ('::1' === clientIP || '127.0.0.1' == clientIP || '::ffff:127.0.0.1' == clientIP) {
            console.log('solicitacao de shutdown realizada');
            shutdownReceived = true;
            let numVerifies = 0;
            let verifier = () => {
                if (currentRequests > 0 && numVerifies < 20) {
                    numVerifies++;
                    console.log('tentativa', numVerifies, 'de shutdown');
                    setTimeout(verifier, 1000);
                } else {
                    console.log('shutdown finalizado com', currentRequests, 'request(s) ativos');
                    db.end();
                    return res.status(204).send();
                }
            };
            verifier();
        } else {
            console.log('tentativa de shutdown com a origem:', clientIP);
            return res.status(204).send();
        }
    }
};