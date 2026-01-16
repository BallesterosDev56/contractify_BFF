# Contractify BFF (Backend for Frontend)

Backend for Frontend API para la plataforma Contractify. Este servicio actúa como capa de orquestación entre el frontend React y los microservicios backend.

## 🏗️ Arquitectura

- **Framework**: Fastify
- **Lenguaje**: TypeScript
- **Validación**: Zod
- **HTTP Client**: Axios
- **Autenticación**: Firebase Admin SDK

## 📋 Características

- ✅ Autenticación con Firebase JWT
- ✅ Validación de requests/responses con Zod
- ✅ Orquestación de microservicios
- ✅ Manejo centralizado de errores
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Logging estructurado
- ✅ TypeScript estricto

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18
- npm o yarn

### Instalación

```bash
npm install
```

### Configuración

Copia `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Variables importantes:
- `FIREBASE_PROJECT_ID`: ID del proyecto Firebase
- `FIREBASE_PRIVATE_KEY`: Clave privada del servicio de Firebase
- `FIREBASE_CLIENT_EMAIL`: Email del servicio de Firebase
- URLs de microservicios

### Desarrollo

```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3000`

### Producción

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── config/          # Configuración (env, etc.)
├── middlewares/     # Middlewares (auth, etc.)
├── routes/          # Rutas organizadas por dominio
├── schemas/         # Schemas de validación Zod
├── services/        # Clientes de microservicios
├── types/           # Definiciones de tipos TypeScript
├── utils/           # Utilidades (errors, logger, etc.)
├── app.ts           # Configuración de Fastify
└── server.ts        # Punto de entrada
```

## 🔐 Autenticación

El BFF valida tokens JWT de Firebase Authentication. Los requests deben incluir:

```
Authorization: Bearer <token>
```

El contexto del usuario se propaga a los microservicios vía headers internos:
- `X-User-Id`
- `X-User-Email`
- `X-User-Role` (si existe)

## 📚 Endpoints

Todos los endpoints siguen la especificación OpenAPI en `/Users/daniicks-macbook/Downloads/docu.yaml`.

### Principales dominios:

- `/users/*` - Gestión de usuarios
- `/contracts/*` - Gestión de contratos
- `/contracts/templates/*` - Plantillas
- `/ai/*` - Generación con IA
- `/documents/*` - Generación de PDFs
- `/signatures/*` - Firmas digitales
- `/notifications/*` - Notificaciones
- `/audit/*` - Auditoría

## 🧪 Testing

```bash
npm run type-check  # Verificar tipos TypeScript
npm run lint        # Linter
```

## 📝 Notas

- El BFF NO contiene lógica de negocio core
- El BFF NO persiste datos
- El BFF actúa como orquestador y adaptador
- Todos los endpoints validan requests contra schemas Zod
- Los errores se manejan de forma uniforme

## 🔧 Troubleshooting

### Error: Firebase configuration is missing
Verifica que las variables de entorno de Firebase estén configuradas correctamente en `.env`.

### Error: Microservice unreachable
Verifica que las URLs de los microservicios sean correctas y que estén ejecutándose.

### Error: Port already in use
Cambia el puerto en `.env` o detén el proceso que está usando el puerto.
