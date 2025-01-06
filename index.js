'use strict';

const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const apiMetrics = require('prometheus-api-metrics');
const { json, urlencoded } = require('express');
const rateLimit = require('express-rate-limit');

const swaggerFile = require('./openapi.json');
const healthcheck = require('./healthcheck');
const { registerNATS } = require('./filter/registerNATS');

const app = express();

// Configuration
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['https://trusted-domain.com'];

// **Set trust proxy**
app.set('trust proxy', 1);

// Middleware Setup
app.use(
  compression(),
  helmet(),
  apiMetrics(),
  healthcheck.countRequests,
  urlencoded({ limit: '10mb', extended: false }),
  json({ limit: '10mb' }),
  cors(),
  morgan(NODE_ENV === 'production' ? 'combined' : 'dev'),
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }),
  registerNATS
);

// Swagger Setup (Only in Development)
if (NODE_ENV !== 'production') {
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

// Health Check Routes
const healthcheckRouter = express.Router();
healthcheckRouter.get('/readiness', healthcheck.readiness);
healthcheckRouter.get('/liveness', healthcheck.liveness);
healthcheckRouter.get('/shutdown', healthcheck.shutdown);
app.use('/healthcheck', healthcheckRouter);

// API Routes
require('./api/routes/consentimentoRoutes')(app);
require('./api/routes/usuarioRoutes')(app);
require('./api/contas')(app);
require('./api/senatran/veiculos/basica/proprietarioPlaca')(app);
require('./api/senatran/infracoes/cpf')(app);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
