# API Response Format Guidelines

This document outlines the standardized API response format for the MentalSpace EHR application.

## Standard Response Format

All API responses should follow a consistent structure:

```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional success message",
  "meta": {
    "requestId": "unique-request-id",
    "processingTimeMs": 42,
    "pagination": { ... },
    "additionalInfo": { ... }
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Fields Explanation

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Either "success" or "error" |
| `data` | any | The main response data (objects, arrays, etc.) |
| `message` | string | Optional message providing additional context |
| `meta` | object | Metadata about the request/response |
| `meta.requestId` | string | Unique identifier for the request (if available) |
| `meta.processingTimeMs` | number | Time taken to process the request in milliseconds |
| `meta.pagination` | object | Pagination information for list endpoints |
| `timestamp` | string | ISO-8601 formatted timestamp of the response |

### Pagination Format

List endpoints should include pagination information in the metadata:

```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "pagination": {
      "page": 2,
      "limit": 10,
      "totalItems": 145,
      "totalPages": 15,
      "hasNextPage": true,
      "hasPrevPage": true
    }
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

## Using the API Response Utilities

The `server/utils/api-response.ts` module provides utility functions to create standardized responses:

### Basic Success Response

For regular successful responses with data:

```typescript
import { sendSuccess } from '../utils/api-response';

router.get('/:id', asyncHandler(async (req, res) => {
  const item = await getItemById(req.params.id);
  sendSuccess(res, item);
}));
```

### Created Resources

For POST requests that create resources:

```typescript
import { sendCreated } from '../utils/api-response';

router.post('/', asyncHandler(async (req, res) => {
  const newItem = await createItem(req.body);
  sendCreated(res, newItem, 'Item created successfully');
}));
```

### Updated Resources

For PUT/PATCH requests that update resources:

```typescript
import { sendUpdated } from '../utils/api-response';

router.patch('/:id', asyncHandler(async (req, res) => {
  const updatedItem = await updateItem(req.params.id, req.body);
  sendUpdated(res, updatedItem, 'Item updated successfully');
}));
```

### No Content Responses

For DELETE operations and other operations that return no content:

```typescript
import { sendSuccessNoContent } from '../utils/api-response';

router.delete('/:id', asyncHandler(async (req, res) => {
  await deleteItem(req.params.id);
  sendSuccessNoContent(res);
}));
```

### Paginated Responses

For list endpoints that return paginated results:

```typescript
import { sendPaginatedSuccess, PaginationMetadata } from '../utils/api-response';

router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const { data, total } = await getItems(page, limit);
  
  const pagination: PaginationMetadata = {
    page,
    limit,
    totalItems: total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1
  };
  
  sendPaginatedSuccess(res, data, pagination);
}));
```

### Using Response Utility Factory

For more complex handlers that need timing information:

```typescript
import { createResponseUtil } from '../utils/api-response';

router.get('/complex', asyncHandler(async (req, res) => {
  const response = createResponseUtil(res);
  
  // Perform operations...
  const data = await performComplexOperation();
  
  // Response will include processing time automatically
  response.success(data, 200, { additionalInfo: 'some context' });
}));
```

## Error Responses

Error responses use the same structure but with different values:

```json
{
  "status": "error",
  "message": "Error message explaining what went wrong",
  "code": "ERROR_CODE",
  "requestId": "unique-request-id",
  "path": "/api/resource",
  "method": "GET",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

Errors are handled by the `errorHandler` middleware - see the [Error Handling Guide](./error-handling-guide.md) for more details.

## HTTP Status Codes

The API uses standard HTTP status codes:

| Code | Description | Example |
|------|-------------|---------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST requests that create a resource |
| 204 | No Content | Successful DELETE requests |
| 400 | Bad Request | Invalid request parameters or body |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authentication successful but insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflicts with existing data |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side errors |
| 503 | Service Unavailable | Service is temporarily unavailable | 