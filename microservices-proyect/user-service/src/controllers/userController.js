const UserModel = require('../models/userModel');
const database = require('../database/db');

class UserController {
    // POST /users - Registrar nuevo usuario
    async createUser(req, res) {
        try {
            const userData = req.body;
            const newUser = await UserModel.create(userData);
            
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    created_at: newUser.created_at
                }
            });
        } catch (error) {
            console.error('Error creating user:', error.message);
            
            if (error.message === 'Email already exists') {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists',
                    error: 'DUPLICATE_EMAIL'
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'DATABASE_ERROR'
            });
        }
    }

    // GET /users - Listar todos los usuarios
    async getAllUsers(req, res) {
        try {
            const users = await UserModel.findAll();
            
            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: users,
                count: users.length
            });
        } catch (error) {
            console.error('Error fetching users:', error.message);
            
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'DATABASE_ERROR'
            });
        }
    }

    // GET /users/:id - Obtener usuario específico
    async getUserById(req, res) {
        try {
            const userId = req.params.id;
            const user = await UserModel.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: user
            });
        } catch (error) {
            console.error('Error fetching user:', error.message);
            
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'DATABASE_ERROR'
            });
        }
    }

    // GET /health - Estado del servicio
    async healthCheck(req, res) {
        try {
            // Verificar conexión a la base de datos
            await database.testConnection();
            
            res.status(200).json({
                status: 'healthy',
                service: 'user-service',
                timestamp: new Date().toISOString(),
                database: 'connected',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.env.npm_package_version || '1.0.0'
            });
        } catch (error) {
            console.error('Health check failed:', error.message);
            
            res.status(503).json({
                status: 'unhealthy',
                service: 'user-service',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: error.message
            });
        }
    }

    // Método auxiliar para verificar si un usuario existe (usado por otros servicios)
    async checkUserExists(req, res) {
        try {
            const userId = req.params.id;
            const exists = await UserModel.exists(userId);
            
            res.status(200).json({
                success: true,
                exists: exists,
                user_id: userId
            });
        } catch (error) {
            console.error('Error checking user existence:', error.message);
            
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'DATABASE_ERROR'
            });
        }
    }
}

module.exports = new UserController();