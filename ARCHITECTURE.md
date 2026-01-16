# Arquitectura del BFF

## 🎯 Principios de Diseño

### Responsabilidades del BFF

✅ **SÍ hace:**
- Orquesta llamadas a múltiples microservicios
- Valida autenticación con Firebase
- Valida requests/responses con Zod
- Adapta respuestas para el frontend
- Maneja errores de forma uniforme
- Propaga contexto de usuario a microservicios
- Implementa rate limiting y seguridad

❌ **NO hace:**
- Lógica de negocio core
- Persistencia de datos
- Generación de PDFs
- Firmas digitales
- Llamadas directas a servicios de IA

## 📐 Estructura de Capas

```
┌─────────────────────────────────────┐
│         Frontend (React)            │
└──────────────┬──────────────────────┘
               │ HTTP/HTTPS
               │ JWT Bearer Token
┌──────────────▼──────────────────────┐
│         BFF (Fastify)               │
│  ┌──────────────────────────────┐  │
│  │  Authentication Middleware   │  │
│  │  (Firebase Admin SDK)        │  │
│  └──────────────┬───────────────┘  │
│  ┌──────────────▼───────────────┐  │
│  │  Validation (Zod)            │  │
│  └──────────────┬───────────────┘  │
│  ┌──────────────▼───────────────┐  │
│  │  Route Handlers              │  │
│  └──────────────┬───────────────┘  │
│  ┌──────────────▼───────────────┐  │
│  │  Microservice Clients        │  │
│  │  (Axios)                     │  │
│  └──────────────┬───────────────┘  │
└──────────────┬──────────────────────┘
               │ Headers: X-User-Id, X-User-Email
               │
┌──────────────▼──────────────────────┐
│      Microservicios Backend          │
│  - Contracts Service                 │
│  - Templates Service                 │
│  - AI Service                        │
│  - Documents Service                 │
│  - Signatures Service                │
│  - Notifications Service             │
│  - Audit Service                     │
│  - Users Service                     │
└──────────────────────────────────────┘
```

## 🔐 Flujo de Autenticación

1. Frontend envía request con `Authorization: Bearer <firebase-jwt-token>`
2. BFF valida token con Firebase Admin SDK
3. BFF extrae contexto del usuario (userId, email, role)
4. BFF propaga contexto a microservicios vía headers:
   - `X-User-Id`: ID del usuario
   - `X-User-Email`: Email del usuario
   - `X-User-Role`: Rol del usuario (si existe)

## 📋 Flujo de Request

1. **Request llega al BFF**
   - Middleware de autenticación valida JWT
   - Middleware de rate limiting verifica límites

2. **Validación**
   - Schema Zod valida request body/query/params
   - Si falla, retorna 400 con detalles

3. **Orquestación**
   - Route handler llama a microservicio(s)
   - Cliente HTTP agrega headers de usuario
   - Maneja timeouts y errores

4. **Respuesta**
   - Adapta respuesta si es necesario
   - Retorna al frontend

## 🛡️ Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para origen específico
- **Rate Limiting**: Límite de requests por ventana de tiempo
- **JWT Validation**: Tokens validados con Firebase Admin SDK
- **Input Validation**: Todos los inputs validados con Zod

## 🔄 Manejo de Errores

Todos los errores se manejan de forma uniforme:

```typescript
{
  code: "ERROR_CODE",
  message: "Human readable message",
  details?: { ... }
}
```

Códigos de error comunes:
- `VALIDATION_ERROR`: Request inválido (400)
- `UNAUTHORIZED`: Token faltante o inválido (401)
- `FORBIDDEN`: Permisos insuficientes (403)
- `NOT_FOUND`: Recurso no encontrado (404)
- `MICROSERVICE_ERROR`: Error del microservicio (502/503)

## 📊 Monitoreo

- Logging estructurado con niveles (error, warn, info, debug)
- Request IDs para trazabilidad
- Health check endpoint: `/health`

## 🚀 Escalabilidad

- Stateless: No mantiene estado entre requests
- Horizontalmente escalable
- Timeouts configurables por microservicio
- Rate limiting por IP/usuario
