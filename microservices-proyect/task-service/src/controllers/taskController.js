const TaskModel = require('../models/taskModel');
const UserService = require('../services/userService');
const database = require('../database/db');

class TaskController {
    // POST /tasks - Crear nueva tarea
    async createTask(req, res) {
        try {
            const taskData = req.body;
            
            // Verificar que el usuario existe antes de crear la tarea
            const userExists = await UserService.checkUserExists(taskData.user_id);
            if (!userExists) {
                return res.status(400).json({
                    success: false,
                    message: 'User does not exist',
                    error: 'INVALID_USER_ID'
                });
            }
            
            const newTask = await TaskModel.create(taskData);
            
            res.status(201).json({
                success: true,
                message: 'Task created successfully',
                data: newTask
            });
        } catch (error) {
            console.error('Error creating task:', error.message);
            
            if (error.message === 'User service is not available') {
                return res.status(503).json({
                    success: false,
                    message: 'User service is not available',
                    error: 'SERVICE_UNAVAILABLE'
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'DATABASE_ERROR'
            });
        }
    }

    // GET /tasks - Listar todas las tareas (con filtro opcional por user_id)
    async getAllTasks(req, res) {
        try {
            let tasks;
            
            if (req.query.user_id) {
                // Filtrar por usuario específico
                const userId = req.query.user_id;
                
                // Verificar que el usuario existe
                const userExists = await UserService.checkUserExists(userId);
                if (!userExists) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found',
                        error: 'USER_NOT_FOUND'
                    });
                }
                
                tasks = await TaskModel.findByUserId(userId);
            } else {
                // Obtener todas las tareas
                tasks = await TaskModel.findAll();
            }
            
            // Obtener información de usuarios para enriquecer la respuesta
            if (tasks.length > 0) {
                const userIds = [...new Set(tasks.map(task => task.user_id))];
                try {
                    const usersInfo = await UserService.getUsersInfo(userIds);
                    
                    // Enriquecer tareas con información del usuario
                    tasks = tasks.map(task => ({
                        ...task,
                        user: usersInfo[task.user_id] || null
                    }));
                } catch (error) {
                    console.warn('Could not enrich tasks with user info:', error.message);
                    // Continuar sin información de usuario
                }
            }
            
            res.status(200).json({
                success: true,
                message: 'Tasks retrieved successfully',
                data: tasks,
                count: tasks.length,
                filters: req.query.user_id ? { user_id: req.query.user_id } : null
            });
        } catch (error) {
            console.error('Error fetching tasks:', error.message);
            
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'DATABASE_ERROR'
            });
        }
    }

    // GET /tasks/:id - Obtener tarea específica
    async getTaskById(req, res) {
        try {
            const taskId = req.params.id;
            const task = await TaskModel.findById(taskId);
            
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found',
                    error: 'TASK_NOT_FOUND'
                });
            }
            
            // Obtener información del usuario
            try {
                const userInfo = await UserService.getUserInfo(task.user_id);
                task.user = userInfo;
            } catch (error) {
                console.warn('Could not get user info for task:', error.message);
                task.user = null;
            }
            
            res.status(200).json({
                success: true,
                message: 'Task retrieved successfully',
                data: task
            });
        } catch (error) {
            console.error('Error fetching task:', error.message);
            
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'DATABASE_ERROR'
            });
        }
    }

    // PUT /tasks/:id - Actualizar tarea completa
    async updateTask(req, res) {
        try {
            const taskId = req.params.id;
            const updateData = req.body;
            
            // Si se está actualizando el user_id, verificar que existe
            if (updateData.user_id) {
                const userExists = await UserService.checkUserExists(updateData.user_id);
                if (!userExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'User does not exist',
                        error: 'INVALID_USER_ID'
                    });
                }
            }
            
            const updatedTask = await TaskModel.update(taskId, updateData);
            
            res.status(200).json({
                success: true,
                message: 'Task updated successfully',
                data: updatedTask
            });
        } catch (error) {
            console.error('Error updating task:', error.message);
            
            if (error.message === 'Task not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found',
                    error: 'TASK_NOT_FOUND'
                });
            }
            
            if (error.message === 'User service is not available') {
                return res.status(503).json({
                    success: false,
                    message: 'User service is not available',
                    error: 'SERVICE_UNAVAILABLE'
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'DATABASE_ERROR'
            });
        }
    }

    // PUT /tasks/:id/status - Actualizar solo el estado de una tarea
    async updateTaskStatus(req, res) {
        try {
            const taskId = req.params.id;
            const { status } = req.body;
            
            const updatedTask = await TaskModel.updateStatus(taskId, status);
            
            res.status(200).json({
                success: true,
                message: 'Task status updated successfully',
                data: updatedTask
            });
        } catch (error) {
            console.error('Error updating task status:', error.message);
            
            if (error.message === 'Task not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found',
                    error: 'TASK_NOT_FOUND'
                });
            }
            
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
            
            // Verificar conexión con user-service
            const userServiceHealthy = await UserService.checkHealth();
            
            const healthStatus = {
                status: 'healthy',
                service: 'task-service',
                timestamp: new Date().toISOString(),
                database: 'connected',
                dependencies: {
                    userService: userServiceHealthy ? 'healthy' : 'unhealthy'
                },
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.env.npm_package_version || '1.0.0'
            };
            
            // Si alguna dependencia falla, marcar como degraded
            if (!userServiceHealthy) {
                healthStatus.status = 'degraded';
            }
            
            const statusCode = healthStatus.status === 'healthy' ? 200 : 206;
            res.status(statusCode).json(healthStatus);
            
        } catch (error) {
            console.error('Health check failed:', error.message);
            
            res.status(503).json({
                status: 'unhealthy',
                service: 'task-service',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: error.message
            });
        }
    }

    // GET /stats - Estadísticas de tareas
    async getTaskStats(req, res) {
        try {
            const [pendingCount, inProgressCount, completedCount] = await Promise.all([
                TaskModel.countByStatus('pendiente'),
                TaskModel.countByStatus('en_progreso'),
                TaskModel.countByStatus('completada')
            ]);
            
            const totalTasks = pendingCount + inProgressCount + completedCount;
            
            res.status(200).json({
                success: true,
                message: 'Task statistics retrieved successfully',
                data: {
                    total: totalTasks,
                    by_status: {
                        pendiente: pendingCount,
                        en_progreso: inProgressCount,
                        completada: completedCount
                    },
                    completion_rate: totalTasks > 0 ? (completedCount / totalTasks * 100).toFixed(2) : 0
                }
            });
        } catch (error) {
            console.error('Error getting task statistics:', error.message);
            
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'DATABASE_ERROR'
            });
        }
    }
}

module.exports = new TaskController();