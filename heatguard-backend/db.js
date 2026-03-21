const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase/Heroku unless you configure CAcerts
  }
});

let db = {
  // Wrapper to mimic sqlite-like methods for easier server.js migration
  run: async (query, params = []) => {
    // Convert ? to $1, $2, etc.
    let index = 1;
    const pgQuery = query.replace(/\?/g, () => `$${index++}`);
    const result = await pool.query(pgQuery, params);
    return { lastID: result.rows[0]?.id || null, changes: result.rowCount };
  },
  get: async (query, params = []) => {
    let index = 1;
    const pgQuery = query.replace(/\?/g, () => `$${index++}`);
    const result = await pool.query(pgQuery, params);
    return result.rows[0];
  },
  all: async (query, params = []) => {
    let index = 1;
    const pgQuery = query.replace(/\?/g, () => `$${index++}`);
    const result = await pool.query(pgQuery, params);
    return result.rows;
  },
  exec: async (query) => {
    return await pool.query(query);
  }
};

async function initDB() {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL Connected');

    // Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name TEXT NOT NULL,
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        last_analysed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS zones (
        id TEXT PRIMARY KEY,
        city_id INTEGER REFERENCES cities(id),
        name TEXT,
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        temp DOUBLE PRECISION,
        aqi INTEGER,
        green_cover DOUBLE PRECISION,
        density INTEGER,
        humidity DOUBLE PRECISION,
        land_use TEXT
      );

      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        zone_id TEXT REFERENCES zones(id),
        interventions_json TEXT,
        summary TEXT,
        projected_reduction TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('PostgreSQL Schema Initialized');
    return db;
  } catch (err) {
    console.error('Database Initialization Error:', err);
    throw err;
  }
}

function getDB() {
  return db;
}

module.exports = { initDB, getDB, pool };
