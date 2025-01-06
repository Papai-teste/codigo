const { Pool } = require('pg');
const config = require('../config')

const pool = new Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_DATABASE,
  user: config.DB_USER,
  password: config.DB_PASSWORD
});

module.exports = {
  query: (sql, params) => {
    return pool.query(sql, params);
  },
  isValid: () => {
    return new Promise((resolve, reject) => {
      pool.query('select now()', (err, result) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  },
  end: () => {
    pool.end();
  }

};