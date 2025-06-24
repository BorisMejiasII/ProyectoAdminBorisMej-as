const Joi = require('joi');

// Estados válidos para las tareas
const VALID_STATUSES = ['pendiente', 'en_progreso', 'completada'];

// Esquema de validación para crear tarea
const createTaskSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(200)
        .required()
        .messages({
            'string.base': 'Title must be a string',
            'string.empty': 'Title is required',
            'string.min': 'Title must be at least 3 characters long',
            'string.max': 'Title cannot exceed 200 characters',
            'any.required': 'Title is required'
        }),
    
    description: Joi.string()
        .max(1000)
        .allow('')
        .optional()
        .messages({
            'string.base': 'Description must be a string',
            'string.max': 'Description cannot exceed 1000 characters'
        }),
    
    user_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'User ID must be a number',
            'number.integer': 'User ID must be an integer',
            'number.positive': 'User ID must be positive',
            'any.required': 'User ID is required'
        }),
    
    status: Joi.string()
        .valid(...VALID_STATUSES)
        .default('pendiente')
        .messages({
            'string.base': 'Status must be a string',
            'any.only': `Status must be one of: ${VALID_STATUSES.join(', ')}`
        })
});

// Esquema de validación para actualizar tarea
const updateTaskSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(200)
        .optional()
        .messages({
            'string.base': 'Title must be a string',
            'string.min': 'Title must be at least 3 characters long',
            'string.max': 'Title cannot exceed 200 characters'
        }),
    
    description: Joi.string()
        .max(1000)
        .allow('')
        .optional()
        .messages({
            'string.base': 'Description must be a string',
            'string.max': 'Description cannot exceed 1000 characters'
        }),
    
    status: Joi.string()
        .valid(...VALID_STATUSES)
        .optional()
        .messages({
            'string.base': 'Status must be a string',
            'any.only': `Status must be one of: ${VALID_STATUSES.join(', ')}`
        })
}).min(1); // Al menos un campo debe estar presente

// Esquema de validación para actualizar solo estado
const updateStatusSchema = Joi.object({
    status: Joi.string()
        .valid(...VALID_STATUSES)
        .required()
        .messages({
            'string.base': 'Status must be a string',
            'any.only': `Status must be one of: ${VALID_STATUSES.join(', ')}`,
            'any.required': 'Status is required'
        })
});

// Middleware para validar creación de tarea
const validateCreateTask = (req, res, next) => {
    const { error, value } = createTaskSchema.validate(req.body, { 
        abortEarly: false,
        stripUnknown: true 
    });

    if (error) {
        const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    req.body = value;
    next();
};

// Middleware para validar actualización de tarea
const validateUpdateTask = (req, res, next) => {
    const { error, value } = updateTaskSchema.validate(req.body, { 
        abortEarly: false,
        stripUnknown: true 
    });

    if (error) {
        const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    req.body = value;
    next();
};

// Middleware para validar actualización de estado
const validateUpdateStatus = (req, res, next) => {
    const { error, value } = updateStatusSchema.validate(req.body, { 
        abortEarly: false,
        stripUnknown: true 
    });

    if (error) {
        const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    req.body = value;
    next();
};

// Middleware para validar ID de tarea
const validateTaskId = (req, res, next) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid task ID. Must be a positive integer.'
        });
    }

    req.params.id = id;
    next();
};

// Middleware para validar user_id en query params
const validateUserIdQuery = (req, res, next) => {
    if (req.query.user_id) {
        const userId = parseInt(req.query.user_id);
        
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user_id in query. Must be a positive integer.'
            });
        }
        
        req.query.user_id = userId;
    }
    
    next();
};

module.exports = {
    validateCreateTask,
    validateUpdateTask,
    validateUpdateStatus,
    validateTaskId,
    validateUserIdQuery,
    VALID_STATUSES,
    schemas: {
        createTaskSchema,
        updateTaskSchema,
        updateStatusSchema
    }
};