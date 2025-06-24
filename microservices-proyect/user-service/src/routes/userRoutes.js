const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { validateCreateUser, validateUserId } = require('../middleware/validation');

// POST /users - Registrar nuevo usuario
router.post('/', validateCreateUser, UserController.createUser);

// GET /users - Listar todos los usuarios
router.get('/', UserController.getAllUsers);

// GET /users/:id - Obtener usuario específico
router.get('/:id', validateUserId, UserController.getUserById);

// GET /users/:id/exists - Verificar si usuario existe (para comunicación interna)
router.get('/:id/exists', validateUserId, UserController.checkUserExists);

// GET /health - Estado del servicio
router.get('/health', UserController.healthCheck);

module.exports = router;