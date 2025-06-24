const axios = require('axios');

class UserService {
    constructor() {
        // URL del user-service (usar nombre del servicio en Docker)
        this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3001';
        this.timeout = 5000; // 5 segundos timeout
    }

    // Verificar si un usuario existe
    async checkUserExists(userId) {
        try {
            const response = await axios.get(
                `${this.userServiceUrl}/users/${userId}/exists`,
                { timeout: this.timeout }
            );
            
            if (response.status === 200 && response.data.success) {
                return response.data.exists;
            }
            
            return false;
        } catch (error) {
            console.error(`Error checking user existence for ID ${userId}:`, error.message);
            
            // Si el servicio no está disponible, lanzar error específico
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                throw new Error('User service is not available');
            }
            
            if (error.response && error.response.status === 404) {
                return false; // Usuario no existe
            }
            
            throw new Error('Failed to verify user existence');
        }
    }

    // Obtener información de un usuario
    async getUserInfo(userId) {
        try {
            const response = await axios.get(
                `${this.userServiceUrl}/users/${userId}`,
                { timeout: this.timeout }
            );
            
            if (response.status === 200 && response.data.success) {
                return response.data.data;
            }
            
            return null;
        } catch (error) {
            console.error(`Error getting user info for ID ${userId}:`, error.message);
            
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                throw new Error('User service is not available');
            }
            
            if (error.response && error.response.status === 404) {
                return null; // Usuario no encontrado
            }
            
            throw new Error('Failed to get user information');
        }
    }

    // Obtener múltiples usuarios (para tareas con información de usuario)
    async getUsersInfo(userIds) {
        try {
            const uniqueUserIds = [...new Set(userIds)]; // Eliminar duplicados
            const userPromises = uniqueUserIds.map(userId => this.getUserInfo(userId));
            
            const users = await Promise.allSettled(userPromises);
            
            // Crear un mapa de usuarios
            const userMap = {};
            users.forEach((result, index) => {
                const userId = uniqueUserIds[index];
                if (result.status === 'fulfilled' && result.value) {
                    userMap[userId] = result.value;
                } else {
                    userMap[userId] = null;
                }
            });
            
            return userMap;
        } catch (error) {
            console.error('Error getting multiple users info:', error.message);
            throw new Error('Failed to get users information');
        }
    }

    // Verificar el estado del user-service
    async checkHealth() {
        try {
            const response = await axios.get(
                `${this.userServiceUrl}/health`,
                { timeout: this.timeout }
            );
            
            return response.status === 200 && response.data.status === 'healthy';
        } catch (error) {
            console.error('User service health check failed:', error.message);
            return false;
        }
    }

    // Validar múltiples usuarios de una vez
    async validateUsers(userIds) {
        try {
            const uniqueUserIds = [...new Set(userIds)];
            const validationPromises = uniqueUserIds.map(userId => 
                this.checkUserExists(userId).then(exists => ({ userId, exists }))
            );
            
            const results = await Promise.allSettled(validationPromises);
            
            const validationMap = {};
            results.forEach((result, index) => {
                const userId = uniqueUserIds[index];
                if (result.status === 'fulfilled') {
                    validationMap[userId] = result.value.exists;
                } else {
                    validationMap[userId] = false;
                }
            });
            
            return validationMap;
        } catch (error) {
            console.error('Error validating multiple users:', error.message);
            throw new Error('Failed to validate users');
        }
    }

    // Método para configurar la URL del servicio (útil para testing)
    setUserServiceUrl(url) {
        this.userServiceUrl = url;
    }
}

module.exports = new UserService();