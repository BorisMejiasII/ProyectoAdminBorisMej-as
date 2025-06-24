const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const { 
    validateCreateTask, 
    validateUpdateTask, 
    validateUpdateStatus, 
    validateTaskId, 
    validateUserIdQuery 
} = require('../middleware/validation');

// POST /tasks - Crear nueva tarea
router.post('/', validateCreateTask, TaskController.createTask);

// GET /tasks - Listar todas las tareas (con filtro opcional por user_id)
router.get('/', validateUserIdQuery, TaskController.getAllTasks);

// GET /tasks/stats - Estadísticas de tareas
router.get('/stats', TaskController.getTaskStats);

// GET /tasks/:id - Obtener tarea específica
router.get('/:id', validateTaskId, TaskController.getTaskById);

// PUT /tasks/:id - Actualizar tarea completa
router.put('/:id', validateTaskId, validateUpdateTask, TaskController.updateTask);

// PUT /tasks/:id/status - Actualizar solo el estado de una tarea
router.put('/:id/status', validateTaskId, validateUpdateStatus, TaskController.updateTaskStatus);

// GET /health - Estado del servicio
router.get('/health', TaskController.healthCheck);

module.exports = router;