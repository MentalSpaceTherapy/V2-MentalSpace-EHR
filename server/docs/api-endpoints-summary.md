# MentalSpace EHR API Endpoints Summary

## Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Authenticate user and get token |
| POST | `/auth/logout` | Logout current user |
| POST | `/auth/register` | Register new user |
| POST | `/auth/password-reset-request` | Request password reset email |
| POST | `/auth/reset-password` | Reset password using token |
| GET | `/auth/me` | Get current user profile |
| POST | `/auth/refresh-token` | Refresh authentication token |
| POST | `/auth/enable-2fa` | Enable two-factor authentication |
| POST | `/auth/verify-2fa` | Verify two-factor authentication code |
| POST | `/auth/disable-2fa` | Disable two-factor authentication |

## Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/clients` | List clients (paginated) |
| GET | `/clients/:id` | Get client by ID |
| POST | `/clients` | Create new client |
| PATCH | `/clients/:id` | Update client |
| DELETE | `/clients/:id` | Delete client (admin only) |

## Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages` | List messages (paginated) |
| GET | `/messages/client/:clientId` | List messages for a client (paginated) |
| GET | `/messages/:id` | Get message by ID |
| POST | `/messages` | Send new message |
| PATCH | `/messages/:id/read` | Mark message as read |
| DELETE | `/messages/:id` | Delete message (admin only) |

## Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sessions` | List therapy sessions (paginated) |
| GET | `/sessions/:id` | Get session by ID |
| POST | `/sessions` | Create new session |
| PATCH | `/sessions/:id` | Update session |
| DELETE | `/sessions/:id` | Delete session |

## Documentation
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documentation` | List documentation (paginated) |
| GET | `/documentation/:id` | Get document by ID |
| POST | `/documentation` | Create new document |
| PATCH | `/documentation/:id` | Update document |
| DELETE | `/documentation/:id` | Delete document |

## Staff
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/staff` | List staff members (paginated) |
| GET | `/staff/:id` | Get staff member by ID |
| POST | `/staff` | Create new staff member |
| PATCH | `/staff/:id` | Update staff member |
| DELETE | `/staff/:id` | Delete staff member |

## Common Query Parameters for Paginated Endpoints
- `page`: Page number (starts at 1)
- `limit`: Items per page (default: 20, max: 100)

## Response Formats

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional success message",
  "meta": { 
    "pagination": { ... } 
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error message",
  "code": "ERROR_CODE",
  "requestId": "unique-request-id",
  "path": "/api/resource",
  "method": "GET",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

## Authentication
All endpoints except authentication endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
``` 