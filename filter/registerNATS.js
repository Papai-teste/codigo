'use strict';

const { StanPool } = require('../nats/nats-pool');

const config = require('../config');

const stanPool = new StanPool({
    name: 'durable-gaap',
    servers: config.NATS_SERVERS.split(','),
    userName: config.NATS_USERNAME,
    password: config.NATS_PASSWORD,
    cluster: config.NATS_CLUSTER,
    subject: config.NATS_SUBJECT
});

module.exports.registerNATS = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    publishMessages(req, res);
    next();
};

function publishMessages(req, res) {
    req.local = {
        message: {
            endpoint: req.originalUrl,
            start: new Date(),
            integracoes: []
        }
    };

    res.once('finish', () => {
        req.local.message.end = new Date();
        req.local.message.statusCode = res.statusCode;
        if (!req.local.message.endpoint.toLowerCase().startsWith("/swagger/"))
            stanPool.publish(req.local.message);
    });
}