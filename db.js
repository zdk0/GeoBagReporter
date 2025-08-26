const pgp = require('pg-promise')();

const isProd = process.env.NODE_ENV === 'production';

const cn = process.env.DATABASE_URL || {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'geo_bag',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'hiu',
};

const db = pgp({
  connectionString: typeof cn === 'string' ? cn : undefined,
  ...(typeof cn !== 'string' ? { ...cn } : {}),
  ...(isProd ? { ssl: { rejectUnauthorized: false } } : {}),
});

module.exports = db;
