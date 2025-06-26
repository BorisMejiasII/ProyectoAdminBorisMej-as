# Proyecto de Microservicios - Gestión de Tareas colaborativa

## Descripción del Proyecto

Este proyecto utiliza una arquitectura de microservicios para gestionar tareas de usuarios. Está desplegado con Docker y orquestado con un Docker-Compose. Incluye un "API Gateway" con Nginx Proxy Manager para enrutar el tráfico hacia los microservicios.

### Componentes del Proyecto (En el docker compose)

1. User Service: Gestiona usuarios (registro y consulta).
2. Task Service: Maneja tareas (creación, actualización y consulta).
3. API Gateway: Punto de entrada único para los microservicios.

### Tecnologías Utilizadas

- Node.js con Express.js para back-end
- SQLite como base de datos
- Docker, Dockerfile y Docker-Compose
- Nginx Proxy Manager para el API Gateway
- HTTP/REST APIs

## Configuración y Despliegue

### Prerrequisitos

- Docker y Docker Compose instalados
- Puertos disponibles: 80, 81, 3001, 3002

### Pasos para Desplegar

1. Clonar el repositorio:
   ```
   git clone BorisMejiasII/ProyectoAdminBorisMej-as
   cd microservices-proyect
   ```

2. Construir y ejecutar los servicios:
   ```
   docker-compose up --build -d
   docker-compose ps
   ```

3. Configurar el API Gateway:
   - Acceder a Nginx Proxy Manager en `http://localhost:81`.
   - Crear Proxy Hosts y configurar rutas para los microservicios.

4. Verificar el despliegue (Desde consola):
   ```
   curl http://localhost/api/users/health
   curl http://localhost/api/tasks/health
   ```

## APIs Disponibles (Pueden ser probadas desde una aplicación como Postman o desde un navegador)
### User Service

- GET `/api/users/health`: Estado del servicio.
- GET `/api/users/`: Listar usuarios.
- POST `/api/users/`: Registrar usuario.

### Task Service

- GET `/api/tasks/health`: Estado del servicio.
- GET `/api/tasks/`: Listar tareas.
- POST `/api/tasks/`: Crear tarea.

## Puertos y Servicios

- API Gateway: Puerto 80
- NPM Admin: Puerto 81
- User Service: Puerto 3001
- Task Service: Puerto 3002

## En caso de problemas se puede utilizar estos comandos para debuggear

- Verificar logs:
  ```
  docker-compose logs
  ```
- Verificar red:
  ```
  docker network ls
  docker network inspect microservices-network
  ```
- Verificar volúmenes:
  ```
  docker volume ls
  ```

## Información del Proyecto

Desarrollado por Boris Mejías para el ramo de Administración de Redes y Sistemas Computacionales, Universidad de Talca, Junio 2025.