# Backend Route Access Audit

Este documento lista todas las rutas expuestas por el backend y su nivel de acceso final.

| Ruta | Método | Nivel final | Nota |
| --- | --- | --- | --- |
| `/api/health` | GET | public | Endpoint de health check sin auth. |

## Auth routes

| Ruta | Método | Nivel final | Nota |
| --- | --- | --- | --- |
| `/api/auth/signup` | POST | public | Registro de usuario. |
| `/api/auth/login` | POST | public | Genera JWT de acceso y refresh. |
| `/api/auth/refresh` | POST | public | Renueva tokens con refresh token. |
| `/api/auth/logout` | POST | public | Logout nominal sin revocación. |
| `/api/auth/me` | GET | authenticated | Requiere JWT válido con `verifyToken`. |
| `/api/auth/profile` | PATCH | authenticated | Requiere JWT válido con `verifyToken`. |
| `/api/auth/change-password` | POST | authenticated | Requiere JWT válido con `verifyToken`. |
| `/api/auth/forgot-password` | POST | public | Inicio de flujo de recuperación. |
| `/api/auth/reset-password` | POST | public | Restablecimiento con PIN. |
| `/api/auth/verify-recovery-email` | POST | public | Verifica existencia de email. |
| `/api/auth/students` | GET | admin-only | `verifyToken` + `adminOnly`. |
| `/api/auth/students/:id/plan` | PATCH | admin-only | `verifyToken` + `adminOnly`. |
| `/api/auth/students/:id` | DELETE | admin-only | `verifyToken` + `adminOnly`. |

## Content routes

| Ruta | Método | Nivel final | Nota |
| --- | --- | --- | --- |
| `/api/content/` | GET | public | `optionalAuth` para contenidos públicos y Filtrado de acceso. |
| `/api/content/free` | GET | authenticated | Sólo usuarios con JWT válido. |
| `/api/content/:id` | GET | public | `optionalAuth`; sólo contenido accesible con el plan actual. |
| `/api/content/upload` | POST | admin-only | `verifyToken` + `adminOnly`. |
| `/api/content/:id` | PUT | admin-only | `verifyToken` + `adminOnly`. |
| `/api/content/:id` | DELETE | admin-only | `verifyToken` + `adminOnly`. |

## Stats routes

| Ruta | Método | Nivel final | Nota |
| --- | --- | --- | --- |
| `/api/stats/visit` | POST | public | Registro de visitas público. |
| `/api/stats/visits` | GET | admin-only | `verifyToken` + `adminOnly`. |
| `/api/stats/user/:id` | GET | admin-only | `verifyToken` + `adminOnly`. |
| `/api/stats/content/:id` | GET | admin-only | `verifyToken` + `adminOnly`. |

## Notas generales

- Todas las rutas protegidas ejecutan `verifyToken` antes de la lógica del controlador.
- Las rutas admin-only ejecutan `adminOnly` después de `verifyToken`.
- Las rutas públicas o semi-públicas (`/api/content/`, `/api/content/:id`) usan `optionalAuth` cuando se permite un JWT opcional, pero bloquean tokens inválidos.
