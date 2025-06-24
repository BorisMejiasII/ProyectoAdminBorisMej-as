const database = require('../database/db');

class TaskModel {
    static async create(taskData) {
        return new Promise((resolve, reject) => {
            try {
                const db = database.getDb();
                const { title, description, user_id, status = 'pendiente' } = taskData;
                
                const query = `
                    INSERT INTO tasks (title, description, user_id, status, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
                `;
                
                db.run(query, [title, description, user_id, status], function(err) {
                    if (err) {
                        console.error('Database error creating task:', err.message);
                        reject(err);
                    } else {
                        console.log('Task created with ID:', this.lastID);
                        resolve({
                            id: this.lastID,
                            title,
                            description,
                            user_id,
                            status,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        });
                    }
                });
            } catch (error) {
                console.error('Error in TaskModel.create:', error.message);
                reject(error);
            }
        });
    }

    static async findAll(filters = {}) {
        return new Promise((resolve, reject) => {
            try {
                const db = database.getDb();
                let query = 'SELECT * FROM tasks';
                let params = [];
                
                if (filters.user_id) {
                    query += ' WHERE user_id = ?';
                    params.push(filters.user_id);
                }
                
                query += ' ORDER BY created_at DESC';
                
                db.all(query, params, (err, rows) => {
                    if (err) {
                        console.error('Database error fetching tasks:', err.message);
                        reject(err);
                    } else {
                        console.log(`Found ${rows.length} tasks`);
                        resolve(rows);
                    }
                });
            } catch (error) {
                console.error('Error in TaskModel.findAll:', error.message);
                reject(error);
            }
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            try {
                const db = database.getDb();
                const query = 'SELECT * FROM tasks WHERE id = ?';
                
                db.get(query, [id], (err, row) => {
                    if (err) {
                        console.error('Database error fetching task:', err.message);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            } catch (error) {
                console.error('Error in TaskModel.findById:', error.message);
                reject(error);
            }
        });
    }

    // AGREGAR ESTE MÉTODO QUE FALTA
    static async findByUserId(userId) {
        return new Promise((resolve, reject) => {
            try {
                const db = database.getDb();
                const query = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC';
                
                db.all(query, [userId], (err, rows) => {
                    if (err) {
                        console.error('Database error fetching tasks by user:', err.message);
                        reject(err);
                    } else {
                        console.log(`Found ${rows.length} tasks for user ${userId}`);
                        resolve(rows);
                    }
                });
            } catch (error) {
                console.error('Error in TaskModel.findByUserId:', error.message);
                reject(error);
            }
        });
    }

    static async update(id, taskData) {
        return new Promise((resolve, reject) => {
            try {
                const db = database.getDb();
                const { title, description, status } = taskData;
                
                const query = `
                    UPDATE tasks 
                    SET title = ?, description = ?, status = ?, updated_at = datetime('now')
                    WHERE id = ?
                `;
                
                db.run(query, [title, description, status, id], function(err) {
                    if (err) {
                        console.error('Database error updating task:', err.message);
                        reject(err);
                    } else if (this.changes === 0) {
                        resolve(null);
                    } else {
                        console.log('Task updated:', id);
                        TaskModel.findById(id)
                            .then(resolve)
                            .catch(reject);
                    }
                });
            } catch (error) {
                console.error('Error in TaskModel.update:', error.message);
                reject(error);
            }
        });
    }

    static async updateStatus(id, status) {
        return new Promise((resolve, reject) => {
            try {
                const db = database.getDb();
                const query = `
                    UPDATE tasks 
                    SET status = ?, updated_at = datetime('now')
                    WHERE id = ?
                `;
                
                db.run(query, [status, id], function(err) {
                    if (err) {
                        console.error('Database error updating task status:', err.message);
                        reject(err);
                    } else if (this.changes === 0) {
                        resolve(null);
                    } else {
                        console.log('Task status updated:', id, 'to', status);
                        TaskModel.findById(id)
                            .then(resolve)
                            .catch(reject);
                    }
                });
            } catch (error) {
                console.error('Error in TaskModel.updateStatus:', error.message);
                reject(error);
            }
        });
    }

    static async countByStatus(status) {
        return new Promise((resolve, reject) => {
            try {
                const db = database.getDb();
                const query = 'SELECT COUNT(*) as count FROM tasks WHERE status = ?';
                
                db.get(query, [status], (err, row) => {
                    if (err) {
                        console.error('Database error counting tasks:', err.message);
                        reject(err);
                    } else {
                        resolve(row.count);
                    }
                });
            } catch (error) {
                console.error('Error in TaskModel.countByStatus:', error.message);
                reject(error);
            }
        });
    }

    // AGREGAR ESTE MÉTODO PARA ESTADÍSTICAS
    static async getStats() {
        return new Promise(async (resolve, reject) => {
            try {
                const pendientes = await this.countByStatus('pendiente');
                const en_progreso = await this.countByStatus('en_progreso');
                const completadas = await this.countByStatus('completada');
                const total = pendientes + en_progreso + completadas;

                resolve({
                    total,
                    pendientes,
                    en_progreso,
                    completadas,
                    porcentaje_completadas: total > 0 ? Math.round((completadas / total) * 100) : 0
                });
            } catch (error) {
                console.error('Error in TaskModel.getStats:', error.message);
                reject(error);
            }
        });
    }
}

module.exports = TaskModel;