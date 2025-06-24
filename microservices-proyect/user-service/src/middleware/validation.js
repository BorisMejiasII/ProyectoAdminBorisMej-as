const Joi = require('joi');

// Esquema de validación para crear usuario
const createUserSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.base': 'Name must be a string',
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name cannot exceed 100 characters',
            'any.required': 'Name is required'
        }),
    
    email: Joi.string()
        .email()
        .max(100)
        .required()
        .messages({
            'string.base': 'Email must be a string',
            'string.empty': 'Email is required',
            'string.email': 'Email must be a valid email address',
            'string.max': 'Email cannot exceed 100 characters',
            'any.required': 'Email is required'
        })
});

// Middleware para validar creación de usuario
const validateCreateUser = (req, res, next) => {
    const { error, value } = createUserSchema.validate(req.body, { 
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

    // Reemplazar req.body con los valores validados y sanitizados
    req.body = value;
    next();
};

// Middleware para validar ID de parámetro
const validateUserId = (req, res, next) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID. Must be a positive integer.'
        });
    }

    req.params.id = id;
    next();
};

// Middleware genérico para manejo de errores de validación
const handleValidationError = (error, req, res, next) => {
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            details: error.message
        });
    }
    next(error);
};

module.exports = {
    validateCreateUser,
    validateUserId,
    handleValidationError,
    schemas: {
        createUserSchema
    }
};