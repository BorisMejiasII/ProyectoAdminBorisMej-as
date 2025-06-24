# Usar Node.js oficial como imagen base
FROM node:18-alpine

# Crear directorio de aplicación
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install --omit=dev

# Copiar código fuente
COPY src/ ./src/

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Crear directorio para la base de datos y dar permisos
RUN mkdir -p /app/data && \
    chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3001

# Comando para ejecutar la aplicación
CMD ["node", "src/app.js"]