const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const DB_DIR = '/app/heatguard-backend/data';
const DB_PATH = path.join(DB_DIR, 'heatguard.db');

let db;

async function initDB() {
  fs.mkdirSync(DB_DIR, { recursive: true });

  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      lat REAL,
      lng REAL,
      last_analysed DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS zones (
      id TEXT PRIMARY KEY,
      city_id INTEGER,
      name TEXT,
      lat REAL,
      lng REAL,
      temp REAL,
      aqi INTEGER,
      green_cover REAL,
      density INTEGER,
      humidity REAL,
      land_use TEXT,
      FOREIGN KEY(city_id) REFERENCES cities(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      zone_id TEXT,
      interventions_json TEXT,
      summary TEXT,
      projected_reduction TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(zone_id) REFERENCES zones(id)
    );
  `);

  console.log('Database initialized');
  return db;
}

function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call initDB first.");
  }
  return db;
}

module.exports = { initDB, getDB };
