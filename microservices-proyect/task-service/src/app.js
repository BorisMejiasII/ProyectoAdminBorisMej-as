const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const database = require('./database/db');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware de seguridad
app.use(helmet());

// CORS configurado para permitir comunicación entre microservicios
app.use(cors({
    origin: ['http://localhost:3001', 'http://user-service:3001', 'http://nginx', 'http://localhost:80'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging
app.use(morgan('combined'));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint directo (antes de las rutas)
app.get('/health', async (req, res) => {
    try {
        await database.testConnection();
        res.status(200).json({
            status: 'healthy',
            service: 'task-service',
            timestamp: new Date().toISOString(),
            database: 'connected',
            uptime: process.uptime(),
            port: PORT
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            service: 'task-service',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
});

// Rutas principales
app.use('/tasks', taskRoutes);

// Ruta de información del servicio
app.get('/', (req, res) => {
    res.json({
        service: 'task-service',
        version: '1.0.0',
        description: 'Microservicio de gestión de tareas',
        endpoints: [
            'GET /health - Health check',
            'GET /tasks - Get all tasks',
            'POST /tasks - Create new task',
            'GET /tasks/:id - Get task by ID',
            'PUT /tasks/:id - Update task',
            'PUT /tasks/:id/status - Update task status',
            'GET /tasks/stats - Get task statistics'
        ]
    });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        error: 'NOT_FOUND',
        service: 'task-service'
    });
});

// Middleware global para manejo de errores
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        service: 'task-service'
    });
});

// Inicializar base de datos y servidor
async function startServer() {
    try {
        // Conectar a la base de datos
        await database.connect(); // ← Esto debe estar presente
        console.log('✅ Database connected successfully');
        
        // Iniciar servidor
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Task Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down Task Service...');
    try {
        await database.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    try {
        await database.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
    }
});

// Iniciar servidor
startServer();

module.exports = app;