const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Usar variable de entorno o path por defecto dentro del contenedor
const dbDir = process.env.DB_PATH ? path.dirname(process.env.DB_PATH) : '/app/data';
const dbPath = process.env.DB_PATH || path.join(dbDir, 'users.db');

class Database {
    constructor() {
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            // Crear directorio si no existe
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error connecting to SQLite database:', err.message);
                    reject(err);
                } else {
                    console.log(`Connected to SQLite database (${dbPath})`);
                    this.createTables()
                        .then(() => resolve(this.db))
                        .catch(reject);
                }
            });
        });
    }

    createTables() {
        return new Promise((resolve, reject) => {
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            this.db.run(createUsersTable, (err) => {
                if (err) {
                    console.error('Error creating users table:', err.message);
                    reject(err);
                } else {
                    console.log('Users table created or already exists');
                    resolve();
                }
            });
        });
    }

    getDb() {
        return this.db;
    }

    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    testConnection() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not connected'));
                return;
            }

            this.db.get('SELECT 1', (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
}

module.exports = new Database();