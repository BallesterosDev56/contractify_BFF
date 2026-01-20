# Documentación del BFF (Backend for Frontend) - Contractify

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura](#arquitectura)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Configuración](#configuración)
5. [Autenticación y Autorización](#autenticación-y-autorización)
6. [Endpoints Implementados](#endpoints-implementados)
7. [Manejo de Errores](#manejo-de-errores)
8. [Integración con Microservicios](#integración-con-microservicios)
9. [Seguridad](#seguridad)
10. [Estructura del Proyecto](#estructura-del-proyecto)

---

## Introducción

El BFF (Backend for Frontend) de Contractify es una capa de orquestación que actúa como intermediario entre el frontend React y los microservicios backend. Su propósito principal es:

- **Simplificar** la comunicación del frontend con múltiples microservicios
- **Validar** todas las peticiones antes de enviarlas a los microservicios
- **Autenticar** usuarios mediante Firebase JWT
- **Propagar** el contexto del usuario a los microservicios
- **Manejar** errores de forma centralizada y consistente

**Versión**: 2.0.0
**Puerto por defecto**: 3000
**Entorno**: Node.js >= 18

---

## Arquitectura

```
Frontend (React)
    ↓
BFF (Fastify) ← Autenticación Firebase
    ↓
Microservicios Backend
```

El BFF **NO** contiene lógica de negocio ni persiste datos. Actúa únicamente como:
- **Orquestador**: Coordina llamadas a múltiples microservicios
- **Adaptador**: Transforma y valida datos entre frontend y backend
- **Proxy autenticado**: Valida tokens y propaga contexto de usuario

---

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Fastify** | ^5.1.0 | Framework web de alto rendimiento |
| **TypeScript** | ^5.7.2 | Lenguaje de programación tipado |
| **Zod** | ^3.24.1 | Validación de esquemas en runtime |
| **Axios** | ^1.7.9 | Cliente HTTP para microservicios |
| **Firebase Admin SDK** | ^13.1.0 | Autenticación y verificación de tokens |
| **@fastify/cors** | ^11.2.0 | Configuración CORS |
| **@fastify/helmet** | ^13.0.2 | Headers de seguridad |
| **@fastify/rate-limit** | ^10.3.0 | Rate limiting |

---

## Configuración

### Variables de Entorno

El BFF utiliza las siguientes variables de entorno (definidas en `src/config/env.ts`):

#### Configuración General
- `PORT`: Puerto del servidor (default: `3000`)
- `NODE_ENV`: Entorno de ejecución (`development` | `production`)
- `API_VERSION`: Versión de la API (default: `v2`)
- `CORS_ORIGIN`: Origen permitido para CORS (default: `https://contractify-frontend.vercel.app`)
- `REQUEST_TIMEOUT`: Timeout para peticiones a microservicios en ms (default: `30000`)

#### Firebase
- `FIREBASE_PROJECT_ID`: ID del proyecto Firebase
- `FIREBASE_PRIVATE_KEY`: Clave privada del servicio (con `\n` escapados)
- `FIREBASE_CLIENT_EMAIL`: Email del servicio de Firebase

#### Microservicios
- `MICROSERVICE_CONTRACTS_URL`: URL del microservicio de contratos (default: `http://localhost:3001`)
- `MICROSERVICE_TEMPLATES_URL`: URL del microservicio de plantillas (default: `http://localhost:3002`)
- `MICROSERVICE_AI_URL`: URL del microservicio de IA (default: `http://localhost:3003`)
- `MICROSERVICE_DOCUMENTS_URL`: URL del microservicio de documentos (default: `http://localhost:3004`)
- `MICROSERVICE_SIGNATURES_URL`: URL del microservicio de firmas (default: `http://localhost:3005`)
- `MICROSERVICE_NOTIFICATIONS_URL`: URL del microservicio de notificaciones (default: `http://localhost:3006`)
- `MICROSERVICE_AUDIT_URL`: URL del microservicio de auditoría (default: `http://localhost:3007`)
- `MICROSERVICE_USERS_URL`: URL del microservicio de usuarios (default: `http://localhost:3008`)

#### Rate Limiting
- `RATE_LIMIT_MAX`: Máximo de peticiones por ventana (default: `100`)
- `RATE_LIMIT_TIME_WINDOW`: Ventana de tiempo en ms (default: `60000` = 1 minuto)

#### Logging
- `LOG_LEVEL`: Nivel de logging (`error` | `warn` | `info` | `debug`, default: `info`)

---

## Autenticación y Autorización

### Autenticación con Firebase

El BFF utiliza Firebase Admin SDK para validar tokens JWT. Todos los endpoints protegidos requieren un header de autorización:

```
Authorization: Bearer <firebase-jwt-token>
```

### Middlewares de Autenticación

#### `authenticateUser`
Valida el token JWT y requiere autenticación obligatoria. Si el token es inválido o está ausente, retorna `401 Unauthorized`.

**Uso**: Endpoints que requieren usuario autenticado.

#### `optionalAuth`
Valida el token JWT si está presente, pero no requiere autenticación obligatoria.

**Uso**: Endpoints públicos que pueden beneficiarse del contexto del usuario si está disponible (ej: vista pública de contratos).

### Contexto de Usuario

Una vez autenticado, el contexto del usuario se almacena en `request.user`:

```typescript
interface UserContext {
  userId: string;        // UID de Firebase
  email: string;         // Email del usuario
  role?: string;         // Rol del usuario (si existe)
  claims?: Record<string, unknown>; // Claims adicionales del token
}
```

### Propagación a Microservicios

El contexto del usuario se propaga automáticamente a los microservicios mediante headers HTTP:

- `X-User-Id`: ID del usuario
- `X-User-Email`: Email del usuario
- `X-User-Role`: Rol del usuario (si existe)

---

## Endpoints Implementados

### Health Check

#### `GET /health`
**Descripción**: Endpoint de salud del servidor
**Autenticación**: No requerida
**Respuesta**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /`
**Descripción**: Endpoint raíz (alias de `/health`)
**Autenticación**: No requerida
**Respuesta**: `200 OK` (mismo formato que `/health`)

---

### Usuarios (`/users`)

Todos los endpoints de usuarios requieren autenticación (`authenticateUser`).

#### `GET /users/me`
**Descripción**: Obtiene el perfil del usuario autenticado
**Autenticación**: Requerida
**Respuesta**: `200 OK` - Perfil del usuario

#### `PATCH /users/me`
**Descripción**: Actualiza el perfil del usuario autenticado
**Autenticación**: Requerida
**Body**: `UpdateUserRequestSchema`
**Respuesta**: `200 OK` - Usuario actualizado

#### `PATCH /users/me/preferences`
**Descripción**: Actualiza las preferencias del usuario
**Autenticación**: Requerida
**Body**: `UpdatePreferencesRequestSchema`
**Respuesta**: `200 OK`

#### `GET /users/me/sessions`
**Descripción**: Lista las sesiones activas del usuario
**Autenticación**: Requerida
**Respuesta**: `200 OK` - Lista de sesiones

#### `DELETE /users/me/sessions/:sessionId`
**Descripción**: Revoca una sesión específica
**Autenticación**: Requerida
**Parámetros**: `sessionId` (string)
**Respuesta**: `204 No Content`

#### `POST /users/change-password`
**Descripción**: Cambia la contraseña del usuario
**Autenticación**: Requerida
**Body**: `ChangePasswordRequestSchema`
**Respuesta**: `200 OK`

---

### Contratos (`/contracts`)

Todos los endpoints de contratos requieren autenticación, excepto `/contracts/:contractId/public`.

#### `GET /contracts`
**Descripción**: Lista contratos con filtros y paginación
**Autenticación**: Requerida
**Query Parameters**: `ContractFiltersSchema` (paginación, filtros, ordenamiento)
**Respuesta**: `200 OK` - Lista paginada de contratos

#### `POST /contracts`
**Descripción**: Crea un nuevo contrato
**Autenticación**: Requerida
**Body**: `CreateContractRequestSchema`
**Respuesta**: `201 Created` - Contrato creado

#### `GET /contracts/stats`
**Descripción**: Obtiene estadísticas de contratos del usuario
**Autenticación**: Requerida
**Respuesta**: `200 OK` - Estadísticas

#### `GET /contracts/recent`
**Descripción**: Obtiene contratos recientes del usuario
**Autenticación**: Requerida
**Respuesta**: `200 OK` - Lista de contratos recientes

#### `GET /contracts/pending`
**Descripción**: Obtiene contratos pendientes del usuario
**Autenticación**: Requerida
**Respuesta**: `200 OK` - Lista de contratos pendientes

#### `GET /contracts/:contractId`
**Descripción**: Obtiene los detalles de un contrato específico
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Respuesta**: `200 OK` - Detalles del contrato

#### `PATCH /contracts/:contractId`
**Descripción**: Actualiza los metadatos de un contrato
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Body**: `UpdateContractRequestSchema`
**Respuesta**: `200 OK` - Contrato actualizado

#### `DELETE /contracts/:contractId`
**Descripción**: Elimina un contrato
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Respuesta**: `204 No Content`

#### `POST /contracts/:contractId/duplicate`
**Descripción**: Duplica un contrato existente
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Respuesta**: `201 Created` - Contrato duplicado

#### `PATCH /contracts/:contractId/content`
**Descripción**: Actualiza el contenido de un contrato
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Body**: `UpdateContractContentRequestSchema`
**Respuesta**: `200 OK`

#### `GET /contracts/:contractId/versions`
**Descripción**: Obtiene el historial de versiones de un contrato
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Respuesta**: `200 OK` - Lista de versiones

#### `PATCH /contracts/:contractId/status`
**Descripción**: Actualiza el estado de un contrato
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Body**: `UpdateContractStatusRequestSchema`
**Respuesta**: `200 OK`

#### `GET /contracts/:contractId/transitions`
**Descripción**: Obtiene las transiciones de estado válidas para un contrato
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Respuesta**: `200 OK` - Lista de transiciones válidas

#### `GET /contracts/:contractId/history`
**Descripción**: Obtiene el historial de actividad de un contrato
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Respuesta**: `200 OK` - Historial de actividad

#### `GET /contracts/:contractId/parties`
**Descripción**: Obtiene las partes (parties) de un contrato
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Respuesta**: `200 OK` - Lista de partes

#### `POST /contracts/:contractId/parties`
**Descripción**: Agrega una parte a un contrato
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Body**: `AddPartyRequestSchema`
**Respuesta**: `201 Created`

#### `DELETE /contracts/:contractId/parties/:partyId`
**Descripción**: Elimina una parte de un contrato
**Autenticación**: Requerida
**Parámetros**: `contractId` (string), `partyId` (string)
**Respuesta**: `204 No Content`

#### `POST /contracts/bulk-download`
**Descripción**: Descarga múltiples contratos en formato ZIP
**Autenticación**: Requerida
**Body**: `BulkDownloadRequestSchema`
**Respuesta**: `200 OK` - Archivo ZIP (`application/zip`)

#### `GET /contracts/:contractId/public`
**Descripción**: Obtiene la vista pública de un contrato (para firmas de invitados)
**Autenticación**: Opcional (`optionalAuth`)
**Parámetros**: `contractId` (string)
**Query Parameters**: `token` (string) - Token de acceso público
**Respuesta**: `200 OK` - Vista pública del contrato

---

### Plantillas (`/contracts/templates`)

Todos los endpoints de plantillas requieren autenticación.

#### `GET /contracts/templates`
**Descripción**: Lista las plantillas de contratos disponibles
**Autenticación**: Requerida
**Query Parameters**: `TemplateFiltersSchema` (filtros y paginación)
**Respuesta**: `200 OK` - Lista de plantillas

#### `GET /contracts/templates/:templateId`
**Descripción**: Obtiene los detalles de una plantilla específica
**Autenticación**: Requerida
**Parámetros**: `templateId` (string)
**Respuesta**: `200 OK` - Detalles de la plantilla

#### `GET /contracts/types`
**Descripción**: Obtiene los tipos de contratos disponibles
**Autenticación**: Requerida
**Respuesta**: `200 OK` - Lista de tipos

#### `GET /contracts/types/:type/schema`
**Descripción**: Obtiene el esquema del formulario para un tipo de contrato específico
**Autenticación**: Requerida
**Parámetros**: `type` (string)
**Respuesta**: `200 OK` - Esquema del formulario

---

### IA (`/ai`)

Todos los endpoints de IA requieren autenticación.

#### `POST /ai/validate-input`
**Descripción**: Valida los inputs del formulario antes de generar el contrato
**Autenticación**: Requerida
**Body**: `ValidateInputRequestSchema`
**Respuesta**: `200 OK` - Resultado de validación

#### `POST /ai/generate-contract`
**Descripción**: Genera contenido de contrato usando IA + RAG
**Autenticación**: Requerida
**Body**: `AIGenerateRequestSchema`
**Respuesta**:
- `200 OK` - Generación síncrona (contenido generado)
- `202 Accepted` - Generación asíncrona (`{ jobId: string }`)

#### `POST /ai/regenerate`
**Descripción**: Regenera un contrato con feedback del usuario
**Autenticación**: Requerida
**Body**: `AIRegenerateRequestSchema`
**Respuesta**: `200 OK` - Contenido regenerado

#### `GET /ai/jobs/:jobId`
**Descripción**: Consulta el estado de un trabajo de generación asíncrono
**Autenticación**: Requerida
**Parámetros**: `jobId` (string)
**Respuesta**: `200 OK` - Estado del trabajo

---

### Documentos (`/documents`)

Todos los endpoints de documentos requieren autenticación.

#### `POST /documents/generate-pdf`
**Descripción**: Genera un PDF a partir del contenido de un contrato
**Autenticación**: Requerida
**Body**: `GeneratePDFRequestSchema`
**Respuesta**: `202 Accepted` - `{ jobId: string }`

#### `GET /documents/:documentId/download`
**Descripción**: Descarga el PDF de un documento
**Autenticación**: Requerida
**Parámetros**: `documentId` (string)
**Query Parameters**: `DownloadDocumentQuerySchema`
**Respuesta**: `200 OK` - Archivo PDF (`application/pdf`)

#### `POST /documents/:documentId/verify`
**Descripción**: Verifica la integridad y firmas de un PDF
**Autenticación**: Requerida
**Parámetros**: `documentId` (string)
**Respuesta**: `200 OK` - Resultado de verificación

#### `GET /documents/jobs/:jobId`
**Descripción**: Consulta el estado de un trabajo de generación de PDF
**Autenticación**: Requerida
**Parámetros**: `jobId` (string)
**Respuesta**: `200 OK` - Estado del trabajo

---

### Firmas (`/signatures`)

Algunos endpoints de firmas son públicos (no requieren autenticación).

#### `POST /signatures/create-token`
**Descripción**: Crea un token de firma para una parte
**Autenticación**: Requerida
**Body**: `CreateSignatureTokenRequestSchema`
**Respuesta**: `201 Created` - Token creado

#### `GET /signatures/validate-token`
**Descripción**: Valida un token de firma (endpoint público)
**Autenticación**: No requerida
**Query Parameters**: `token` (string)
**Respuesta**: `200 OK` - Resultado de validación

#### `POST /signatures/sign`
**Descripción**: Firma un contrato (usuario autenticado)
**Autenticación**: Requerida
**Body**: `SignRequestSchema`
**Respuesta**: `200 OK` - Firma completada

#### `POST /signatures/sign-guest`
**Descripción**: Firma un contrato como invitado (endpoint público con token)
**Autenticación**: No requerida
**Body**: `GuestSignRequestSchema`
**Respuesta**: `200 OK` - Firma completada

#### `GET /contracts/:contractId/signatures`
**Descripción**: Obtiene todas las firmas de un contrato
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Respuesta**: `200 OK` - Lista de firmas

#### `POST /signatures/:signatureId/evidence`
**Descripción**: Almacena evidencia de una firma
**Autenticación**: Requerida
**Parámetros**: `signatureId` (string)
**Body**: Datos de evidencia
**Respuesta**: `201 Created`

#### `GET /signatures/:signatureId/certificate`
**Descripción**: Descarga el certificado de una firma
**Autenticación**: Requerida
**Parámetros**: `signatureId` (string)
**Respuesta**: `200 OK` - Archivo PDF del certificado (`application/pdf`)

---

### Notificaciones (`/notifications`)

Todos los endpoints de notificaciones requieren autenticación.

#### `POST /notifications/send-invitation`
**Descripción**: Envía una invitación de firma a una parte
**Autenticación**: Requerida
**Body**: `SendInvitationRequestSchema`
**Respuesta**: `200 OK` - Invitación enviada

#### `POST /notifications/invitations/:invitationId/cancel`
**Descripción**: Cancela una invitación pendiente
**Autenticación**: Requerida
**Parámetros**: `invitationId` (string)
**Respuesta**: `200 OK`

#### `POST /notifications/invitations/:invitationId/resend`
**Descripción**: Reenvía una invitación
**Autenticación**: Requerida
**Parámetros**: `invitationId` (string)
**Respuesta**: `200 OK`

#### `GET /notifications/templates`
**Descripción**: Obtiene las plantillas de email disponibles
**Autenticación**: Requerida
**Respuesta**: `200 OK` - Lista de plantillas

#### `POST /notifications/reminders`
**Descripción**: Programa un recordatorio para un contrato sin firmar
**Autenticación**: Requerida
**Body**: `ScheduleReminderRequestSchema`
**Respuesta**: `201 Created`

---

### Auditoría (`/audit`)

Todos los endpoints de auditoría requieren autenticación.

#### `GET /audit/contracts/:contractId/trail`
**Descripción**: Obtiene el trail completo de auditoría de un contrato
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Respuesta**: `200 OK` - Trail de auditoría

#### `GET /audit/contracts/:contractId/export`
**Descripción**: Exporta el trail de auditoría como PDF
**Autenticación**: Requerida
**Parámetros**: `contractId` (string)
**Respuesta**: `200 OK` - Archivo PDF (`application/pdf`)

---

## Manejo de Errores

### Estructura de Error

Todos los errores retornan el siguiente formato:

```json
{
  "code": "ERROR_CODE",
  "message": "Mensaje descriptivo del error",
  "details": {
    // Detalles adicionales (opcional)
  }
}
```

### Códigos de Error

| Código | HTTP Status | Descripción |
|--------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Error de validación de datos (Zod) |
| `UNAUTHORIZED` | 401 | Token inválido o ausente |
| `FORBIDDEN` | 403 | Permisos insuficientes |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `MICROSERVICE_ERROR` | 502/503 | Error del microservicio |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |
| `UNKNOWN_ERROR` | 500 | Error desconocido |

### Clases de Error

El BFF define las siguientes clases de error personalizadas:

- `AppError`: Error base
- `ValidationError`: Error de validación (400)
- `UnauthorizedError`: Error de autenticación (401)
- `ForbiddenError`: Error de autorización (403)
- `NotFoundError`: Recurso no encontrado (404)
- `MicroserviceError`: Error del microservicio (502/503)

### Manejo de Errores de Microservicios

Cuando un microservicio retorna un error:
1. El error se captura y se loguea
2. Se convierte a `MicroserviceError`
3. Se retorna al cliente con el código HTTP apropiado

---

## Integración con Microservicios

### Cliente de Microservicios

El BFF utiliza la clase `MicroserviceClient` para comunicarse con los microservicios. Esta clase:

- **Agrega headers de contexto de usuario** automáticamente
- **Maneja timeouts** configurados
- **Intercepta errores** y los convierte a `MicroserviceError`
- **Soporta streams** para descargas de archivos

### Microservicios Integrados

| Microservicio | Cliente | URL por defecto |
|---------------|---------|-----------------|
| Contratos | `contractsClient` | `http://localhost:3001` |
| Plantillas | `templatesClient` | `http://localhost:3002` |
| IA | `aiClient` | `http://localhost:3003` |
| Documentos | `documentsClient` | `http://localhost:3004` |
| Firmas | `signaturesClient` | `http://localhost:3005` |
| Notificaciones | `notificationsClient` | `http://localhost:3006` |
| Auditoría | `auditClient` | `http://localhost:3007` |
| Usuarios | `usersClient` | `http://localhost:3008` |

### Métodos Disponibles

El `MicroserviceClient` expone los siguientes métodos:

- `get<T>(path, params?, user?)`: GET request
- `post<T>(path, data?, user?)`: POST request
- `patch<T>(path, data?, user?)`: PATCH request
- `put<T>(path, data?, user?)`: PUT request
- `delete<T>(path, user?)`: DELETE request
- `getStream(path, params?, user?)`: GET request que retorna Buffer
- `postStream(path, data?, user?)`: POST request que retorna Buffer

---

## Seguridad

### Headers de Seguridad (Helmet)

El BFF utiliza `@fastify/helmet` para agregar headers de seguridad HTTP. La política CSP está deshabilitada por defecto (configurable según necesidades).

### CORS

CORS está configurado para permitir solo el origen especificado en `CORS_ORIGIN`. Las credenciales están habilitadas.

### Rate Limiting

Rate limiting está configurado con:
- **Máximo de peticiones**: 100 (configurable)
- **Ventana de tiempo**: 60 segundos (configurable)

### Validación de Inputs

Todos los inputs se validan con **Zod** antes de ser enviados a los microservicios. Esto previene:
- Inyección de datos maliciosos
- Datos malformados
- Tipos incorrectos

### Autenticación

- Tokens JWT de Firebase se validan en cada petición protegida
- Tokens inválidos o expirados son rechazados inmediatamente
- El contexto del usuario se propaga de forma segura a los microservicios

---

## Estructura del Proyecto

```
contractify_bff/
├── src/
│   ├── app.ts                    # Configuración de Fastify
│   ├── server.ts                 # Punto de entrada
│   ├── config/
│   │   └── env.ts                # Configuración de variables de entorno
│   ├── middlewares/
│   │   └── auth.ts               # Middlewares de autenticación
│   ├── routes/
│   │   ├── users.routes.ts       # Rutas de usuarios
│   │   ├── contracts.routes.ts  # Rutas de contratos
│   │   ├── templates.routes.ts  # Rutas de plantillas
│   │   ├── ai.routes.ts          # Rutas de IA
│   │   ├── documents.routes.ts   # Rutas de documentos
│   │   ├── signatures.routes.ts # Rutas de firmas
│   │   ├── notifications.routes.ts # Rutas de notificaciones
│   │   └── audit.routes.ts       # Rutas de auditoría
│   ├── schemas/
│   │   ├── common.schemas.ts     # Schemas comunes (paginación, params)
│   │   ├── user.schemas.ts       # Schemas de usuarios
│   │   ├── contract.schemas.ts   # Schemas de contratos
│   │   ├── template.schemas.ts   # Schemas de plantillas
│   │   ├── ai.schemas.ts         # Schemas de IA
│   │   ├── document.schemas.ts   # Schemas de documentos
│   │   ├── signature.schemas.ts  # Schemas de firmas
│   │   ├── notification.schemas.ts # Schemas de notificaciones
│   │   └── party.schemas.ts      # Schemas de partes
│   ├── services/
│   │   └── microservice.client.ts # Cliente de microservicios
│   ├── types/
│   │   └── index.ts              # Definiciones de tipos TypeScript
│   └── utils/
│       ├── errors.ts             # Manejo de errores
│       └── logger.ts             # Utilidad de logging
├── dist/                         # Código compilado (TypeScript → JavaScript)
├── package.json                  # Dependencias y scripts
├── tsconfig.json                 # Configuración de TypeScript
└── README.md                     # README básico
```

---

## Scripts Disponibles

```bash
# Desarrollo (con watch)
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start

# Verificar tipos TypeScript
npm run type-check

# Linter
npm run lint
```

---

## Notas Importantes

1. **El BFF NO persiste datos**: Todos los datos se almacenan en los microservicios
2. **El BFF NO contiene lógica de negocio**: Solo orquesta y valida
3. **Validación estricta**: Todos los inputs se validan con Zod antes de enviar a microservicios
4. **Propagación de contexto**: El contexto del usuario se propaga automáticamente a todos los microservicios
5. **Manejo centralizado de errores**: Todos los errores se manejan de forma consistente
6. **TypeScript estricto**: El código está completamente tipado

---

## Troubleshooting

### Error: Firebase configuration is missing
**Causa**: Variables de entorno de Firebase no configuradas
**Solución**: Verificar que `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY` y `FIREBASE_CLIENT_EMAIL` estén en `.env`

### Error: Microservice unreachable
**Causa**: Microservicio no está ejecutándose o URL incorrecta
**Solución**: Verificar que el microservicio esté corriendo y que la URL en `.env` sea correcta

### Error: Port already in use
**Causa**: Puerto 3000 (o el configurado) está en uso
**Solución**: Cambiar `PORT` en `.env` o detener el proceso que usa el puerto

### Error: CORS
**Causa**: Origen del frontend no está en `CORS_ORIGIN`
**Solución**: Agregar el origen del frontend a `CORS_ORIGIN` en `.env`

---

## Resumen de Endpoints por Dominio

| Dominio | Endpoints | Autenticación |
|---------|-----------|---------------|
| Health | 2 | No requerida |
| Usuarios | 6 | Requerida |
| Contratos | 19 | Requerida (1 opcional) |
| Plantillas | 4 | Requerida |
| IA | 4 | Requerida |
| Documentos | 4 | Requerida |
| Firmas | 7 | Mixta (3 públicos, 4 protegidos) |
| Notificaciones | 5 | Requerida |
| Auditoría | 2 | Requerida |
| **TOTAL** | **53** | |

---

**Última actualización**: Enero 2024
**Versión del BFF**: 2.0.0
