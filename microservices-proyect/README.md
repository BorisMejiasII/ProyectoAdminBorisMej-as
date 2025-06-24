# Proyecto de Microservicios - Gestión de Tareas colaborativa

## 📋 Descripción del Proyecto

Este proyecto implementa una **arquitectura de microservicios** para gestión de tareas colaborativa, desplegada con **Docker** y orquestada con **Docker Compose**. La aplicación incluye un **API Gateway** con **Nginx Proxy Manager** que enruta el tráfico hacia los microservicios de forma segura.

### 🏗️ Arquitectura

La aplicación está compuesta por los siguientes componentes:

1. **User Service** (`user-service`): Gestiona registro y consulta de usuarios
2. **Task Service** (`task-service`): Maneja creación, actualización y consulta de tareas
3. **API Gateway** (`nginx-proxy-manager`): Punto de entrada único que enruta el tráfico

```
[Cliente] → [API Gateway:80] → [user-service:3001]
                            → [task-service:3002]
         ↗ [Admin Panel:81]
```

## 🚀 Tecnologías Utilizadas

- **Backend**: Node.js con Express.js
- **Base de datos**: SQLite
- **Contenedores**: Docker & Docker Compose
- **API Gateway**: Nginx Proxy Manager
- **Comunicación**: HTTP/REST APIs

## 📁 Estructura del Proyecto

```
microservices-proyect/
├── user-service/
│   ├── src/
│   │   ├── app.js              # Aplicación principal
│   │   ├── database.js         # Configuración SQLite
│   │   ├── routes/
│   │   │   └── users.js        # Rutas de usuarios
│   │   └── middleware/
│   │       └── validation.js   # Validaciones
│   ├── Dockerfile
│   ├── package.json
│   └── users.db               # Base de datos SQLite
├── task-service/
│   ├── src/
│   │   ├── app.js              # Aplicación principal
│   │   ├── database.js         # Configuración SQLite
│   │   ├── routes/
│   │   │   └── tasks.js        # Rutas de tareas
│   │   └── middleware/
│   │       └── validation.js   # Validaciones
│   ├── Dockerfile
│   ├── package.json
│   └── tasks.db               # Base de datos SQLite
├── nginx-custom/
│   └── server_proxy.conf      # Configuración personalizada NPM
├── docker-compose.yml         # Orquestación de servicios
└── README.md                 # Este archivo
```

## 🔧 Configuración y Despliegue

### Prerrequisitos

- Docker instalado (versión 20.10+)
- Docker Compose instalado (versión 2.0+)
- 8GB RAM disponible
- Puertos disponibles: 80, 81, 3001, 3002

### 🚀 Instrucciones de Despliegue

#### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd microservices-proyect
```

#### 2. Construir y ejecutar los servicios

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Verificar que los contenedores estén corriendo
docker-compose ps
```

#### 3. Configurar el API Gateway

1. **Acceder a Nginx Proxy Manager**: `http://localhost:81`
2. **Login inicial**:
   - Email: `admin@example.com`
   - Password: `changeme`
3. **Crear Proxy Host**:
   - Domain Names: `localhost`
   - Scheme: `http`
   - Forward Hostname: `user-service`
   - Forward Port: `3001`
4. **Configurar Custom Locations**:
   
   **Location 1: `/api/users/health`**
   ```
   Define location: /api/users/health
   Forward Hostname: user-service
   Forward Port: 3001
   Custom config: rewrite ^/api/users/health$ /health break;
   ```
   
   **Location 2: `/api/users/`**
   ```
   Define location: /api/users/
   Forward Hostname: user-service
   Forward Port: 3001
   Custom config: rewrite ^/api/users/(.*)$ /users/$1 break;
   ```
   
   **Location 3: `/api/tasks/health`**
   ```
   Define location: /api/tasks/health
   Forward Hostname: task-service
   Forward Port: 3002
   Custom config: rewrite ^/api/tasks/health$ /health break;
   ```
   
   **Location 4: `/api/tasks/`**
   ```
   Define location: /api/tasks/
   Forward Hostname: task-service
   Forward Port: 3002
   Custom config: rewrite ^/api/tasks/(.*)$ /tasks/$1 break;
   ```

#### 4. Verificar el despliegue

```bash
# Health checks
curl http://localhost/api/users/health
curl http://localhost/api/tasks/health

# Endpoints de usuarios
curl http://localhost/api/users/
curl -X POST http://localhost/api/users/ -H "Content-Type: application/json" -d '{"name":"Juan","email":"juan@example.com"}'

# Endpoints de tareas
curl http://localhost/api/tasks/
curl -X POST http://localhost/api/tasks/ -H "Content-Type: application/json" -d '{"title":"Tarea 1","description":"Descripción","userId":1}'
```

## 📚 APIs Disponibles

### 👥 User Service (`/api/users/`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users/health` | Estado del servicio |
| GET | `/api/users/` | Listar todos los usuarios |
| GET | `/api/users/{id}` | Obtener usuario específico |
| POST | `/api/users/` | Registrar nuevo usuario |

**Ejemplo de usuario:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com"
}
```

### 📝 Task Service (`/api/tasks/`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tasks/health` | Estado del servicio |
| GET | `/api/tasks/` | Listar todas las tareas |
| GET | `/api/tasks/{id}` | Obtener tarea específica |
| GET | `/api/tasks?user_id=X` | Filtrar tareas por usuario |
| POST | `/api/tasks/` | Crear nueva tarea |
| PUT | `/api/tasks/{id}` | Actualizar estado de tarea |

**Estados de tareas**: `pendiente`, `en progreso`, `completada`

**Ejemplo de tarea:**
```json
{
  "title": "Implementar API",
  "description": "Desarrollar endpoints REST",
  "userId": 1,
  "status": "pendiente"
}
```

## 🔍 Monitoreo y Logs

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs user-service
docker-compose logs task-service
docker-compose logs nginx-proxy-manager

# Ver logs en tiempo real
docker-compose logs -f
```

## 🛠️ Comandos Útiles

```bash
# Parar todos los servicios
docker-compose down

# Reconstruir imágenes
docker-compose build

# Reiniciar servicios
docker-compose restart

# Ver estado de contenedores
docker-compose ps

# Ejecutar comando en contenedor
docker-compose exec user-service sh
docker-compose exec task-service sh
```

## 🗄️ Base de Datos

### Esquema User Service
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Esquema Task Service
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pendiente',
  userId INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🌐 Puertos y Servicios

| Servicio | Puerto Interno | Puerto Externo | Descripción |
|----------|----------------|----------------|-------------|
| API Gateway | 80 | 80 | Punto de entrada principal |
| NPM Admin | 81 | 81 | Interfaz de administración |
| User Service | 3001 | 3001 | Servicio de usuarios |
| Task Service | 3002 | 3002 | Servicio de tareas |

## 🚨 Troubleshooting

### Problema: NPM no inicia
```bash
# Verificar logs
docker-compose logs nginx-proxy-manager

# Limpiar volúmenes
docker-compose down
docker volume prune
docker-compose up -d
```

### Problema: Servicios no se comunican
```bash
# Verificar red
docker network ls
docker network inspect microservices-proyect_microservices-network

# Ping entre contenedores
docker-compose exec user-service ping task-service
```

### Problema: Base de datos no persiste
```bash
# Verificar volúmenes
docker volume ls
docker volume inspect microservices-proyect_user_data
```

## 👨‍💻 Desarrollado por

**Boris Mejías**  
Administración de Redes y Sistemas Computacionales  
Universidad de Talca - I Semestre 2025

## 📄 Licencia

Este proyecto es parte de un trabajo académico para la asignatura de Administración de Redes y Sistemas Computacionales.

---

**Profesor**: Ricardo Pérez  
**Correo**: riperez@utalca.cl  
**Fecha**: Junio 2025