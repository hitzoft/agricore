# Instrucciones para Correr el Proyecto Agricore

Este documento detalla los pasos necesarios para levantar el entorno de desarrollo y realizar el despliegue.

## Requisitos Previos

*   **Node.js & npm**: Necesarios para el frontend.
*   **Firebase CLI**: Necesario para el despliegue (`npm install -g firebase-tools`).

## Arquitectura

El proyecto es una **PWA (Progressive Web App)** con arquitectura **Serverless**:
- **Frontend**: React + Vite + Tailwind CSS.
- **Persistencia Local**: IndexedDB (vía Dexie.js).
- **Backend & Cloud**: Firebase (Firestore, Authentication, Hosting).

## Pasos para Inicializar

### 1. Instalación de Dependencias

Desde la raíz del proyecto:

```bash
npm install
```

### 2. Ejecutar Entorno de Desarrollo

Arranca el servidor de desarrollo de Vite:

```bash
npm run dev
```

El sistema estará disponible en: [http://localhost:5173](http://localhost:5173)

### 3. Despliegue a Producción

Para desplegar a Firebase Hosting:

```bash
npm run build
firebase deploy
```

---

## Características Técnicas

- **Sincronización Offline**: Los datos se guardan primero localmente y se sincronizan automáticamente con la nube cuando hay red.
- **Autenticación**: Integración exclusiva con Google SSO.
- **Seguridad**: Reglas de Cloud Firestore para asegurar que cada usuario vea solo sus datos.
