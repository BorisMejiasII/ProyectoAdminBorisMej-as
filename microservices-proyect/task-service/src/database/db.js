const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../tasks.db');

class Database {
    constructor() {
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error connecting to SQLite database:', err.message);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database (tasks.db)');
                    this.createTables()
                        .then(() => resolve(this.db))
                        .catch(reject);
                }
            });
        });
    }

    createTables() {
        return new Promise((resolve, reject) => {
            const createTasksTable = `
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title VARCHAR(200) NOT NULL,
                    description TEXT,
                    user_id INTEGER NOT NULL,
                    status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_progreso', 'completada')),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;
            
            this.db.run(createTasksTable, (err) => {
                if (err) {
                    console.error('Error creating tasks table:', err.message);
                    reject(err);
                } else {
                    console.log('Tasks table created or already exists');
                    resolve();
                }
            });
        });
    }

    async testConnection() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not connected'));
                return;
            }

            this.db.get('SELECT 1 as test', (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    getDb() {
        if (!this.db) {
            throw new Error('Database not initialized. Call connect() first.');
        }
        return this.db;
    }

    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        this.db = null;
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

// Crear y exportar instancia singleton
const database = new Database();
module.exports = database;