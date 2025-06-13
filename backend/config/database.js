require('dotenv').config();

module.exports = {
  development: {
    username: 'postgres',
    password: process.env.DB_PASSWORD || 'SATOSANb6...',
    database: 'studyconnect',
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  test: {
    username: 'postgres',
    password: process.env.DB_PASSWORD || 'SATOSANb6...',
    database: 'studyconnect_test',
    host: '127.0.0.1',
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'studyconnect',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: process.env.NODE_ENV === 'production',
        rejectUnauthorized: false
      }
    }
  }
}; 