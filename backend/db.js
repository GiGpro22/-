const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST || process.env.DB_HOST || 'localhost',
  user: process.env.PG_USER || process.env.DB_USER || 'postgres',
  password: process.env.PG_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.PG_DATABASE || process.env.DB_NAME || 'golden_flower_db',
  port: process.env.PG_PORT || process.env.DB_PORT || 5432,
});

// Проверка подключения
pool.on('connect', () => {
  console.log('Подключение к PostgreSQL установлено');
});

pool.on('error', (err) => {
  console.error('Ошибка подключения к PostgreSQL:', err);
});

module.exports = pool;

