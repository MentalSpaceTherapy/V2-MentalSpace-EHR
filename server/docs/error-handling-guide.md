# Error Handling Guide for MentalSpace EHR

This guide explains our standardized approach to error handling across the MentalSpace EHR application.

## Core Principles

1. **Consistency**: All errors should be handled in a uniform way
2. **Detailed Information**: Errors should provide enough context for debugging
3. **Security**: Error messages exposed to clients should not reveal sensitive information
4. **Operational vs. Programming Errors**: We distinguish between expected errors (operational) and bugs (programming errors)

## The ApiError Class

The foundation of our error system is the `ApiError` class in `server/utils/api-error.ts`. This class extends the standard JavaScript `Error` class with additional properties:

```typescript
class ApiError extends Error {
  readonly statusCode: number;       // HTTP status code
  readonly code: ErrorCode;          // Application-specific error code
  readonly details?: any;            // Additional error details
  readonly source?: string;          // Error source (component or module)
  readonly timestamp: Date;          // When the error occurred  
  readonly operational: boolean;     // Whether the error is operational or programming
}
```

## Error Types and Factory Functions

Instead of manually creating `ApiError` instances, use the factory functions from `server/utils/api-error.ts`:

### Authentication Errors

- `authenticationRequiredError()`: When a user needs to be authenticated
- `invalidCredentialsError()`: When login credentials are incorrect
- `sessionExpiredError()`: When a user's session has expired

### Authorization Errors

- `forbiddenError()`: When a user doesn't have permission for an action
- `insufficientPermissionsError()`: When specific permissions are missing

### Resource Errors

- `resourceNotFoundError(resourceType, identifier)`: When a requested resource doesn't exist
- `resourceExistsError(resourceType, identifier)`: When a resource already exists

### Validation Errors

- `validationError(message, details)`: For general validation failures
- `missingRequiredFieldError(fieldName)`: When a required field is missing
- `invalidParameterError(paramName, reason)`: When a parameter is invalid

### Database Errors

- `databaseError(message, details)`: For database-related errors

### Operation Errors

- `operationFailedError(operation, reason)`: When an operation fails

## Handling Errors in Route Handlers

Always use the `asyncHandler` wrapper from `server/utils/error-handler.ts` for route handlers with async operations:

```typescript
import { asyncHandler } from '../utils/error-handler';
import { resourceNotFoundError } from '../utils/api-error';

router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const resource = await storage.getResource(id);
  
  if (!resource) {
    throw resourceNotFoundError('Resource', id);
  }
  
  res.json(resource);
}));
```

## Handling Database Errors

Use the `withDatabaseErrorHandling` utility from `server/utils/api-error-migration.ts` to wrap database operations:

```typescript
import { withDatabaseErrorHandling } from '../utils/api-error-migration';

const result = await withDatabaseErrorHandling(
  () => database.query('SELECT * FROM users WHERE id = $1', [userId]),
  'Failed to retrieve user data'
);
```

## Error Response Format

All API errors are formatted consistently by the `errorHandler` middleware:

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "code": "APPLICATION_ERROR_CODE",
  "requestId": "unique-request-id",
  "path": "/api/resource",
  "method": "GET",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

In development environments, additional details and stack traces are included.

## Logging Errors

The error handler automatically logs errors with appropriate severity levels:

- 5xx errors: `logger.error()`
- 4xx authentication/authorization errors: `logger.warn()`
- Other 4xx errors: `logger.info()`

For custom logging, use the logger directly:

```typescript
import { logger } from '../logger';

logger.error(`Failed to process payment for user ${userId}`, error);
```

## Migration from Legacy Error Handling

If you're updating old code, refer to `server/utils/api-error-migration.ts` for guidelines on transitioning to the new system.

## Best Practices

1. **Use specific error types** rather than generic ones
2. **Include identifiers** in error messages (e.g., resource IDs)
3. **Provide context** in error messages to aid debugging
4. **Catch and rethrow** with more specific errors when appropriate
5. **Don't expose sensitive information** in client-facing error messages

## Testing Error Handling

Test your error handling with both valid and invalid inputs. Ensure that:

1. The correct error type is thrown
2. The error message is helpful
3. The HTTP status code matches the error type
4. Sensitive information is not exposed

See `server/__tests__/error-handling.test.ts` for examples. 