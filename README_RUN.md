# Instrucciones para Correr el Proyecto Agricore

Este documento detalla los pasos necesarios para levantar el entorno de desarrollo.

## Requisitos Previos

*   **Docker Desktop**: Asegúrate de que esté abierto y funcionando.
*   **Java 17+**: Necesario para el backend.
*   **Node.js & npm**: Necesarios para el frontend.

## Pasos para Inicializar

### 1. Base de Datos (Docker)

Navega a la carpeta del backend y levanta el contenedor de PostgreSQL:

```bash
cd backend
docker-compose up -d
```

> [!IMPORTANT]
> La base de datos corre en el puerto **5433**.

### 2. Backend (Spring Boot)

Desde la misma carpeta `backend`, ejecuta el siguiente comando:

```bash
./mvnw spring-boot:run
```

El backend estará disponible en: [http://localhost:8081](http://localhost:8081)

### 3. Frontend (Vite)

Navega a la raíz del proyecto y arranca el servidor de desarrollo:

```bash
cd ..
npm run dev
```

El frontend estará disponible en: [http://localhost:5173](http://localhost:5173)

---

## Solución de Problemas

*   **Error de conexión a la BD**: Verifica que Docker esté corriendo y que el puerto 5433 no esté ocupado.
*   **Error de CORS**: El backend está configurado para aceptar peticiones desde `http://localhost:5173`. Si el frontend corre en otro puerto, actualiza `application.properties`.
