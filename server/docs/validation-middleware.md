# Zod Validation Middleware Guide

This guide explains how to use the Zod validation middleware in the MentalSpace EHR application to validate and transform request data.

## Overview

The validation middleware uses [Zod](https://github.com/colinhacks/zod) to validate incoming request data against predefined schemas. It integrates with our standardized API error handling system to provide consistent error responses.

## Basic Usage

### 1. Define a Schema

First, define a Zod schema that describes the expected data structure:

```typescript
// schemas/client.schema.ts
import { z } from 'zod';

export const createClientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  notes: z.string().optional(),
  primaryTherapistId: z.number().positive().optional()
});
```

### 2. Apply the Validation Middleware

Use the middleware in your route handlers:

```typescript
import { Router } from 'express';
import { validateBody } from '../middleware/validation';
import { createClientSchema } from '../schemas/client.schema';
import { asyncHandler } from '../utils/error-handler';
import { sendCreated } from '../utils/api-response';

const router = Router();

router.post('/', 
  validateBody(createClientSchema), 
  asyncHandler(async (req, res) => {
    // At this point, req.body has been validated
    // If validation failed, the middleware would have sent an error response
    
    const client = await storage.createClient(req.body);
    sendCreated(res, client, 'Client created successfully');
  })
);

export default router;
```

## Validation Options

The validation middleware accepts several options:

```typescript
interface ValidationOptions {
  // Whether to abort validation on the first error
  abortEarly?: boolean;
  
  // The message to use for the error
  message?: string;
  
  // Additional details to include with the error
  details?: any;
}
```

Example with options:

```typescript
validateBody(createClientSchema, {
  message: "Client data is invalid",
  details: { additionalContext: "Please check all required fields" }
})
```

## Validating Different Request Parts

The middleware can validate different parts of the request:

```typescript
// Validate request body
validateBody(createClientSchema)

// Validate query parameters
validateQuery(searchSchema)

// Validate URL parameters
validateParams(idParamSchema)

// Validate headers
validate(authHeadersSchema, ValidationTarget.HEADERS)
```

## Validating Multiple Request Parts

You can validate multiple parts of a request in a single middleware:

```typescript
import { validateRequest, ValidationTarget } from '../middleware/validation';

router.get('/search',
  validateRequest({
    [ValidationTarget.QUERY]: searchQuerySchema,
    [ValidationTarget.HEADERS]: authHeadersSchema
  }),
  asyncHandler(async (req, res) => {
    // Both query parameters and headers have been validated
    // ...
  })
);
```

## Data Transformation

The middleware also supports transforming data while validating it:

```typescript
import { transformRequest, ValidationTarget } from '../middleware/validation';

// Define a schema with transformations
const searchQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => parseInt(val) || 10),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  sortBy: z.string().default('createdAt')
});

router.get('/clients',
  transformRequest(searchQuerySchema, ValidationTarget.QUERY),
  asyncHandler(async (req, res) => {
    // req.query now contains parsed and transformed values
    // page and limit are numbers, status has a default value
    const { page, limit, status, sortBy } = req.query;
    
    // ...rest of the handler
  })
);
```

## Error Responses

When validation fails, the middleware will automatically:

1. Format the validation errors
2. Log the validation failure
3. Send a standardized error response

The error response will look like:

```json
{
  "status": "error",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "path": ["firstName"],
        "message": "First name is required",
        "code": "too_small"
      },
      {
        "path": ["email"],
        "message": "Invalid email format",
        "code": "invalid_string"
      }
    ],
    "target": "body",
    "path": "/api/clients"
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

## Best Practices

1. **Create reusable schemas**: Place schemas in dedicated files and reuse them across routes
2. **Add descriptive error messages**: Customize error messages in schemas for better user feedback
3. **Use schema composition**: Compose schemas from smaller parts for more maintainable code
4. **Leverage Zod transformations**: Use Zod's transform capabilities to parse and normalize data
5. **Validate early**: Place validation middleware before business logic to fail fast

## Advanced Schema Examples

### Partial Update Schema

For PATCH endpoints, use Zod's `.partial()` method:

```typescript
// For PATCH /clients/:id
export const updateClientSchema = createClientSchema.partial();
```

### Nested Objects

Zod makes it easy to validate nested objects:

```typescript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/)
});

const clientWithAddressSchema = createClientSchema.extend({
  address: addressSchema
});
```

### Arrays

Validating arrays of items:

```typescript
const tagsSchema = z.array(z.string()).min(1).max(5);

const clientWithTagsSchema = createClientSchema.extend({
  tags: tagsSchema
});
```

### Custom Validations

Add custom validation logic:

```typescript
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Password must contain at least one lowercase letter"
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Password must contain at least one number"
  );
``` 