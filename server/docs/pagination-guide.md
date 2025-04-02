# Pagination Guide for API Endpoints

This guide explains how pagination is implemented in the MentalSpace EHR application's API endpoints.

## Overview

Pagination is essential for efficiently handling large datasets in API responses. The MentalSpace EHR API implements a consistent pagination pattern across all list endpoints.

## How to Use Paginated Endpoints

### Request Parameters

All paginated endpoints accept the following query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | The page number to retrieve (starts at 1) |
| `limit` | number | 20 | Number of items per page (max 100) |

Example requests:

```
GET /api/clients?page=2&limit=10
GET /api/messages?page=1&limit=50&isRead=false
```

### Response Format

Paginated responses follow a consistent structure:

```json
{
  "status": "success",
  "data": [
    { /* item 1 */ },
    { /* item 2 */ },
    /* ... more items ... */
  ],
  "meta": {
    "pagination": {
      "page": 2,
      "limit": 10,
      "totalItems": 156,
      "totalPages": 16,
      "hasNextPage": true,
      "hasPrevPage": true
    },
    "filters": {
      /* applied filters summary */
    }
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

## Paginated Endpoints

The following API endpoints support pagination:

### Clients

```
GET /api/clients
```

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `therapistId` (number, optional): Filter by therapist
- `status` (string, optional): Filter by status ('active', 'inactive', 'all')
- `search` (string, optional): Search by name or other identifiers

### Messages

```
GET /api/messages
```

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `therapistId` (number, optional): Filter by therapist
- `clientId` (number, optional): Filter by client
- `isRead` (boolean, optional): Filter by read status
- `category` (string, optional): Filter by category
- `search` (string, optional): Search message content
- `startDate` (date, optional): Filter by date range (start)
- `endDate` (date, optional): Filter by date range (end)

```
GET /api/messages/client/:clientId
```

**Path Parameters:**
- `clientId` (number): Client ID

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

## Implementing Pagination in Route Handlers

Route handlers implement pagination using the following pattern:

```typescript
import { 
  validateQuery, 
  sendPaginatedSuccess 
} from '../utils/api-response';
import { paginationSchema } from '../utils/pagination';

// Define a schema that includes pagination fields
const listQuerySchema = z.object({
  // Your specific filters...
  
  // Include pagination fields
  page: paginationSchema.shape.page,
  limit: paginationSchema.shape.limit
});

router.get('/', 
  validateQuery(listQuerySchema),
  asyncHandler(async (req, res) => {
    // Extract pagination and filter parameters
    const { page, limit, ...filters } = req.query;
    
    // Get paginated results
    const result = await storage.getItems(filters, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      offset: ((parseInt(page) || 1) - 1) * (parseInt(limit) || 20)
    });
    
    // Create pagination metadata
    const pagination = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      totalItems: result.total,
      totalPages: Math.ceil(result.total / (parseInt(limit) || 20)),
      hasNextPage: (parseInt(page) || 1) < Math.ceil(result.total / (parseInt(limit) || 20)),
      hasPrevPage: (parseInt(page) || 1) > 1
    };
    
    // Send paginated response
    sendPaginatedSuccess(res, result.data, pagination, {
      filters
    });
  })
);
```

## Implementing Pagination in Storage Methods

Storage methods implement pagination using this pattern:

```typescript
interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
}

// Sample implementation
async function getItems(
  filters: any, 
  pagination?: PaginationParams
): Promise<PaginatedResult<Item>> {
  // Default pagination
  const { page = 1, limit = 20, offset = 0 } = pagination || {};
  
  // Build the query with filters
  const whereClause = buildWhereClause(filters);
  
  // Get total count
  const countQuery = `SELECT COUNT(*) AS total FROM items ${whereClause}`;
  const countResult = await db.query(countQuery);
  const total = parseInt(countResult.rows[0].total);
  
  // Get paginated data
  const dataQuery = `
    SELECT * FROM items 
    ${whereClause} 
    ORDER BY createdAt DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const dataResult = await db.query(dataQuery);
  
  return {
    data: dataResult.rows,
    total
  };
}
```

## Best Practices

1. **Always validate pagination parameters** to ensure they are within acceptable ranges
2. **Set reasonable defaults** (page=1, limit=20)
3. **Enforce maximum limits** to prevent excessive resource usage (limit ≤ 100)
4. **Include total count** to allow clients to calculate total pages
5. **Return pagination metadata** including hasNextPage/hasPrevPage flags
6. **Document pagination parameters** in API documentation
7. **Use consistent parameter naming** (page, limit) across all endpoints

## Performance Considerations

- Consider adding database indexes on frequently filtered columns
- Cache total counts for high-volume endpoints where exact counts aren't critical
- Use optimized COUNT queries for large tables
- Consider implementing cursor-based pagination for very large datasets 