# Validation, Sanitization, Rate Limiting, and Security

## Validation strategy

The backend uses centralized validation via Zod schemas and a reusable middleware function in `Backend/middleware/validate.js`.

- Request payloads are sanitized before validation.
- Unknown fields are stripped from `req.body`, `req.params`, and `req.query`.
- All string fields are trimmed.
- Email fields are lowercased automatically.
- Validation errors return a consistent JSON structure without raw library details.

## Route-by-route validation rules

### Auth routes

`POST /api/auth/signup`
- `name`: required string, min 2, max 50
- `email`: required valid email
- `password`: required string, min 8, at least one number

`POST /api/auth/login`
- `email`: required valid email
- `password`: required non-empty string

`POST /api/auth/refresh`
- `refreshToken`: required non-empty string

### Content routes

`POST /api/content/upload`
- `title`: required string, min 3, max 120
- `type`: required enum(`video`, `article`, `quiz`)
- `description`: required string, min 10
- `url`: optional valid URL
- `tags`: optional array of non-empty strings

`PUT /api/content/:id`
- Accepts the same fields as POST but all are optional.
- Requires at least one field to be present.

`GET /api/content`
- `page`: optional integer, minimum 1, default `1`
- `limit`: optional integer, minimum 1, maximum 50, default `20`
- `type`: optional enum(`video`, `article`, `quiz`)

### Stats routes

`GET /api/stats/user/:id`
- `id`: required string, valid UUID or MongoDB ObjectId

`GET /api/stats/content/:id`
- `id`: required string, valid UUID or MongoDB ObjectId

## Sanitization behavior

Sanitization helpers in `Backend/middleware/validate.js` perform:

- trimming whitespace from strings
- lowercasing email-like fields
- normalizing nested objects and arrays
- removing unexpected fields via Zod `.strip()` semantics

Controllers receive sanitized and validated payloads through `req.body`, `req.params`, or `req.query`.

## Rate limiting behavior

Rate limiting is configured in `Backend/middleware/rateLimiter.js`.

- Global limiter: 100 requests per 15 minutes per IP
- Auth limiter: 10 requests per 15 minutes per IP

Responses on limit exceeded:

```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

## Security headers

`Backend/app.js` applies Helmet before all other middleware:

```js
app.use(helmet());
```

This enables standard security headers including:

- `X-DNS-Prefetch-Control`
- `X-Frame-Options`
- `Strict-Transport-Security`
- `X-Download-Options`
- `X-Content-Type-Options`
- `X-Permitted-Cross-Domain-Policies`
- `Referrer-Policy`
- `X-XSS-Protection`

## Example invalid requests

### Missing required field

`POST /api/auth/signup`

```json
{
  "email": "test@example.com",
  "password": "Password1"
}
```

### Invalid enum value

`POST /api/content/upload`

```json
{
  "title": "New lesson",
  "type": "audio",
  "description": "A course description",
  "url": "https://example.com"
}
```

### Invalid query params

`GET /api/content?page=-1&limit=100`

## Example validation response

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "fields": {
    "page": "Page must be an integer greater than or equal to 1",
    "limit": "Limit cannot exceed 50"
  }
}
```
