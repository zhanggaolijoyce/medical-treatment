const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "data.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      must_change_password INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctor_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      category TEXT,
      consent_signed INTEGER NOT NULL DEFAULT 0,
      enroll_date TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    );

    CREATE TABLE IF NOT EXISTS consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      consent_text_version TEXT,
      signed_name TEXT,
      signed_phone TEXT,
      signed_at TEXT,
      ip TEXT,
      user_agent TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      form_type TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    );
  `);

  const doctorCount = db.prepare("SELECT COUNT(*) AS count FROM doctors").get()
    .count;
  if (doctorCount === 0) {
    const insert = db.prepare(
      "INSERT INTO doctors (phone, password_hash, must_change_password, created_at) VALUES (?, ?, ?, ?)"
    );
    const hash = bcrypt.hashSync("123456", 10);
    const now = new Date().toISOString();
    const tx = db.transaction(() => {
      for (let i = 1; i <= 30; i += 1) {
        const phone = `130000000${String(i).padStart(2, "0")}`;
        insert.run(phone, hash, 1, now);
      }
    });
    tx();
  }
}

module.exports = { db, init };
