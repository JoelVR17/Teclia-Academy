# Local uploads mode

## Cómo activar modo local

Set `LOCAL_UPLOADS=true` in your environment before starting the backend.

## Cómo volver a Supabase

Set `LOCAL_UPLOADS=false` (or remove the variable) and make sure your Supabase credentials are present.

## Estructura de carpetas

The backend stores files under:

- `Backend/uploads/<subfolder>/<filename>` for local mode

## Limitaciones

- URLs are not signed or expiring.
- There is no access control beyond the server route protections.
- This mode is intended for local development and small test environments.

## Ejemplos

### Upload

```js
const storagePath = await storage.upload(req.file, 'courses');
```

### Retrieval

```js
const url = storage.resolveUrl(storagePath);
```

### Delete

```js
await storage.delete(storagePath);
```
