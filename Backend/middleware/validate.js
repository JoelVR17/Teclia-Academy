import { z } from 'zod';

const emailKeyPattern = /email/i;

const sanitizeValue = (value, key) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return emailKeyPattern.test(key) ? trimmed.toLowerCase() : trimmed;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key));
  }

  if (value && typeof value === 'object') {
    return sanitizeObject(value);
  }

  return value;
};

const sanitizeObject = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  return Object.keys(payload).reduce((acc, key) => {
    acc[key] = sanitizeValue(payload[key], key);
    return acc;
  }, {});
};

const buildErrorFields = (issues) => {
  return issues.reduce((fields, issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'value';
    if (!fields[path]) {
      fields[path] = issue.message;
    }
    return fields;
  }, {});
};

const getSchemaWithStrip = (schema) => {
  if (schema && typeof schema === 'object' && typeof schema.strip === 'function') {
    return schema.strip();
  }
  return schema;
};

const validate = (schema, options = {}) => {
  const target = options.target || 'body';

  return (req, res, next) => {
    const source = req[target] || {};
    const sanitizedPayload = sanitizeObject(source);
    const schemaToUse = getSchemaWithStrip(schema);

    const result = schemaToUse.safeParse(sanitizedPayload);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        fields: buildErrorFields(result.error.issues),
      });
    }

    req[target] = result.data;
    next();
  };
};

export default validate;
