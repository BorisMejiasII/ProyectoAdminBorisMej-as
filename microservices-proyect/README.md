# Proyecto de Microservicios - Gestión de Tareas

## Descripción

Aplicación de gestión de tareas colaborativa desarrollada con arquitectura de microservicios utilizando Docker y Docker Compose.

## Arquitectura

La aplicación está compuesta por:

- **User Service** (Puerto 3001): Gestión de usuarios
- **Task Service** (Puerto 3002): Gestión de tareas
- **API Gateway** (Puerto 80): Nginx como proxy inverso

## Requisitos Previos

- Docker Desktop instalado
- Docker Compose v3.8+
- Git

## Instalación y Despliegue

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd miroservices-proyect
```

### 2. Construir y ejecutar los servicios
```bash
docker-compose up --build
```

### 3. Verificar el estado de los servicios
```bash
# Ver logs
docker-compose logs -f

# Verificar servicios activos
docker-compose ps

# Health checks
curl http://localhost/health
curl http://localhost/api/users/health
curl http://localhost/api/tasks/health
```

## Endpoints de la API

### Servicio de Usuarios (`/api/users/`)

- `POST /api/users/` - Registrar nuevo usuario
- `GET /api/users/` - Listar todos los usuarios
- `GET /api/users/{id}` - Obtener usuario específico
- `GET /api/users/{id}/exists` - Verificar si usuario existe
- `GET /api/users/health` - Estado del servicio

### Servicio de Tareas (`/api/tasks/`)

- `POST /api/tasks/` - Crear nueva tarea
- `GET /api/tasks/` - Listar todas las tareas
- `GET /api/tasks/{id}` - Obtener tarea específica
- `PUT /api/tasks/{id}` - Actualizar tarea
- `PUT /api/tasks/{id}/status` - Actualizar estado de tarea
- `GET /api/tasks?user_id=X` - Filtrar tareas por usuario
- `GET /api/tasks/stats` - Estadísticas de tareas
- `GET /api/tasks/health` - Estado del servicio

## Ejemplos de Uso

### Crear un usuario
```bash
curl -X POST http://localhost/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com"
  }'
```

### Crear una tarea
```bash
curl -X POST http://localhost/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Completar proyecto",
    "description": "Finalizar el desarrollo del microservicio",
    "user_id": 1,
    "status": "pendiente"
  }'
```

### Obtener todas las tareas
```bash
curl http://localhost/api/tasks/
```

### Filtrar tareas por usuario
```bash
curl http://localhost/api/tasks/?user_id=1
```

## Estructura del Proyecto

```
miroservices-proyect/
├── user-service/
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── Dockerfile
│   └── package.json
├── task-service/
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── services/
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Estados de Tareas

- `pendiente`: Tarea recién creada
- `en_progreso`: Tarea en desarrollo
- `completada`: Tarea finalizada

## Comandos Útiles

### Detener servicios
```bash
docker-compose down
```

### Reconstruir servicios
```bash
docker-compose up --build --force-recreate
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f user-service
docker-compose logs -f task-service
docker-compose logs -f nginx
```

### Acceder al contenedor
```bash
docker-compose exec user-service sh
docker-compose exec task-service sh
```

## Monitoreo y Debugging

### Health Checks
Todos los servicios incluyen health checks automáticos:
- Intervalo: 30 segundos
- Timeout: 10 segundos
- Reintentos: 3

### Logs
Los logs están configurados para mostrar información detallada:
- Requests HTTP (Morgan)
- Errores de aplicación
- Estado de conexiones a base de datos

## Persistencia de Datos

- Base de datos SQLite para cada servicio
- Volúmenes Docker para persistencia
- Backup automático en directorio local

## Troubleshooting

### Problemas comunes

1. **Puerto ocupado**: Cambiar puertos en docker-compose.yml
2. **Servicios no se comunican**: Verificar red Docker
3. **Base de datos corrupta**: Eliminar volúmenes y recrear

### Limpiar entorno
```bash
docker-compose down -v
docker system prune -f
```

## Autor

Proyecto desarrollado para el curso de Administración de Redes y Sistemas Computacionales.

## Licencia

MIT License