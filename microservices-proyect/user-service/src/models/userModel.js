const database = require('../database/db');

class UserModel {
    static async create(userData) {
        return new Promise((resolve, reject) => {
            const db = database.getDb(); // ← Debe ser getDb(), no getDatabase()
            const { name, email } = userData;
            
            if (!db) {
                reject(new Error('Database not connected'));
                return;
            }
            
            const query = `
                INSERT INTO users (name, email, created_at) 
                VALUES (?, ?, datetime('now'))
            `;
            
            db.run(query, [name, email], function(err) {
                if (err) {
                    console.error('Error creating user:', err.message);
                    reject(err);
                } else {
                    console.log('User created with ID:', this.lastID);
                    resolve({
                        id: this.lastID,
                        name,
                        email,
                        created_at: new Date().toISOString()
                    });
                }
            });
        });
    }

    static async findAll() {
        return new Promise((resolve, reject) => {
            const db = database.getDb(); // ← Debe ser getDb()
            
            if (!db) {
                reject(new Error('Database not connected'));
                return;
            }
            
            const query = 'SELECT * FROM users ORDER BY created_at DESC';
            
            db.all(query, [], (err, rows) => {
                if (err) {
                    console.error('Error fetching users:', err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            const db = database.getDb(); // ← Debe ser getDb()
            
            if (!db) {
                reject(new Error('Database not connected'));
                return;
            }
            
            const query = 'SELECT * FROM users WHERE id = ?';
            
            db.get(query, [id], (err, row) => {
                if (err) {
                    console.error('Error fetching user:', err.message);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            const db = database.getDb(); // ← Debe ser getDb()
            
            if (!db) {
                reject(new Error('Database not connected'));
                return;
            }
            
            const query = 'SELECT * FROM users WHERE email = ?';
            
            db.get(query, [email], (err, row) => {
                if (err) {
                    console.error('Error fetching user by email:', err.message);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    static async exists(id) {
        return new Promise((resolve, reject) => {
            const db = database.getDb(); // ← Debe ser getDb()
            
            if (!db) {
                reject(new Error('Database not connected'));
                return;
            }
            
            const query = 'SELECT COUNT(*) as count FROM users WHERE id = ?';
            
            db.get(query, [id], (err, row) => {
                if (err) {
                    console.error('Error checking user existence:', err.message);
                    reject(err);
                } else {
                    resolve(row.count > 0);
                }
            });
        });
    }
}

module.exports = UserModel;