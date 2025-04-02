# MentalSpace EHR API Documentation

This document provides comprehensive documentation for the MentalSpace EHR API.

## Base URL

All API endpoints are relative to the base URL:

```
https://api.mentalspace-ehr.com/api
```

For local development:

```
http://localhost:3001/api
```

## Authentication

Most API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### Authentication Endpoints

#### Login

Authenticates a user and returns a JWT token.

```
POST /auth/login
```

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "your-password"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "therapist"
    }
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

#### Logout

Invalidates the current user's session.

```
POST /auth/logout
```

**Response:**
```json
{
  "status": "success",
  "message": "Successfully logged out",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

#### Register

Creates a new user account.

```
POST /auth/register
```

**Request Body:**
```json
{
  "username": "newuser",
  "password": "your-secure-password",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "role": "therapist"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 2,
      "username": "newuser",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "role": "therapist"
    }
  },
  "message": "User registered successfully",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

#### Password Reset Request

Sends a password reset link to the user's email.

```
POST /auth/password-reset-request
```

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "If an account with that email exists, a password reset link has been sent",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

#### Reset Password

Resets the user's password using a token.

```
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "new-secure-password"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password reset successful",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

## Common Patterns

### Error Responses

All API errors follow a consistent format:

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

### Pagination

List endpoints support pagination using the following query parameters:

- `page`: The page number (starting from 1)
- `limit`: Number of items per page (default: 20, max: 100)

Example:
```
GET /clients?page=2&limit=10
```

Paginated responses follow this format:

```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "pagination": {
      "page": 2,
      "limit": 10,
      "totalItems": 156,
      "totalPages": 16,
      "hasNextPage": true,
      "hasPrevPage": true
    }
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

## Clients

### Get All Clients

Returns a paginated list of clients.

```
GET /clients
```

**Query Parameters:**
- `page`: Page number (starts at 1)
- `limit`: Items per page (default: 20, max: 100)
- `therapistId`: Filter by therapist ID
- `status`: Filter by status ('active', 'inactive', 'all')
- `search`: Search by name, email, or other identifiers

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "firstName": "James",
      "lastName": "Johnson",
      "email": "james.johnson@example.com",
      "phone": "555-123-4567",
      "dateOfBirth": "1985-06-15T00:00:00.000Z",
      "address": "123 Main St, Anytown, USA",
      "status": "active",
      "primaryTherapistId": 1
    },
    {...}
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 45,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "status": "active"
    }
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Get Client by ID

Returns a specific client by ID.

```
GET /clients/:id
```

**Path Parameters:**
- `id`: Client ID

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "firstName": "James",
    "lastName": "Johnson",
    "email": "james.johnson@example.com",
    "phone": "555-123-4567",
    "dateOfBirth": "1985-06-15T00:00:00.000Z",
    "address": "123 Main St, Anytown, USA",
    "status": "active",
    "primaryTherapistId": 1
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Create Client

Creates a new client.

```
POST /clients
```

**Request Body:**
```json
{
  "firstName": "Sarah",
  "lastName": "Parker",
  "email": "sarah.parker@example.com",
  "phone": "555-987-6543",
  "dateOfBirth": "1990-12-25",
  "address": "456 Elm St, Anytown, USA",
  "status": "active",
  "primaryTherapistId": 1
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "firstName": "Sarah",
    "lastName": "Parker",
    "email": "sarah.parker@example.com",
    "phone": "555-987-6543",
    "dateOfBirth": "1990-12-25T00:00:00.000Z",
    "address": "456 Elm St, Anytown, USA",
    "status": "active",
    "primaryTherapistId": 1
  },
  "message": "Client created successfully",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Update Client

Updates an existing client.

```
PATCH /clients/:id
```

**Path Parameters:**
- `id`: Client ID

**Request Body:**
```json
{
  "phone": "555-555-5555",
  "address": "789 Oak St, Anytown, USA",
  "status": "inactive"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "firstName": "Sarah",
    "lastName": "Parker",
    "email": "sarah.parker@example.com",
    "phone": "555-555-5555",
    "dateOfBirth": "1990-12-25T00:00:00.000Z",
    "address": "789 Oak St, Anytown, USA",
    "status": "inactive",
    "primaryTherapistId": 1
  },
  "message": "Client updated successfully",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Delete Client

Deletes a client (administrator only).

```
DELETE /clients/:id
```

**Path Parameters:**
- `id`: Client ID

**Response:**
```
204 No Content
```

## Messages

### Get All Messages

Returns a paginated list of messages for the current user.

```
GET /messages
```

**Query Parameters:**
- `page`: Page number (starts at 1)
- `limit`: Items per page (default: 20, max: 100)
- `therapistId`: Filter by therapist ID (admin only)
- `clientId`: Filter by client ID
- `isRead`: Filter by read status (true/false)
- `category`: Filter by category
- `search`: Search message content
- `startDate`: Filter by date range (start)
- `endDate`: Filter by date range (end)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "clientId": 1,
      "therapistId": 1,
      "content": "Hello, I'd like to reschedule my appointment.",
      "subject": "Appointment Rescheduling",
      "category": "scheduling",
      "sender": "client",
      "isRead": false,
      "status": "active",
      "createdAt": "2023-04-01T09:30:00.000Z"
    },
    {...}
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 35,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "isRead": false
    }
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Get Client Messages

Returns a paginated list of messages for a specific client.

```
GET /messages/client/:clientId
```

**Path Parameters:**
- `clientId`: Client ID

**Query Parameters:**
- `page`: Page number (starts at 1)
- `limit`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "clientId": 1,
      "therapistId": 1,
      "content": "Hello, I'd like to reschedule my appointment.",
      "subject": "Appointment Rescheduling",
      "category": "scheduling",
      "sender": "client",
      "isRead": false,
      "status": "active",
      "createdAt": "2023-04-01T09:30:00.000Z"
    },
    {...}
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 12,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "client": {
      "id": 1,
      "name": "James Johnson"
    }
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Get Message by ID

Returns a specific message by ID.

```
GET /messages/:id
```

**Path Parameters:**
- `id`: Message ID

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "clientId": 1,
    "therapistId": 1,
    "content": "Hello, I'd like to reschedule my appointment.",
    "subject": "Appointment Rescheduling",
    "category": "scheduling",
    "sender": "client",
    "isRead": false,
    "status": "active",
    "createdAt": "2023-04-01T09:30:00.000Z"
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Send Message

Creates a new message.

```
POST /messages
```

**Request Body:**
```json
{
  "clientId": 1,
  "content": "Your appointment has been rescheduled to Monday at 2pm.",
  "subject": "Re: Appointment Rescheduling",
  "category": "scheduling"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "clientId": 1,
    "therapistId": 1,
    "content": "Your appointment has been rescheduled to Monday at 2pm.",
    "subject": "Re: Appointment Rescheduling",
    "category": "scheduling",
    "sender": "therapist",
    "isRead": false,
    "status": "active",
    "createdAt": "2023-04-01T12:34:56.789Z"
  },
  "message": "Message sent successfully",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Mark Message as Read

Marks a message as read.

```
PATCH /messages/:id/read
```

**Path Parameters:**
- `id`: Message ID

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "clientId": 1,
    "therapistId": 1,
    "content": "Hello, I'd like to reschedule my appointment.",
    "subject": "Appointment Rescheduling",
    "category": "scheduling",
    "sender": "client",
    "isRead": true,
    "status": "active",
    "createdAt": "2023-04-01T09:30:00.000Z"
  },
  "message": "Message marked as read",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Delete Message

Deletes a message (administrator only).

```
DELETE /messages/:id
```

**Path Parameters:**
- `id`: Message ID

**Response:**
```
204 No Content
```

## Sessions

### Get All Sessions

Returns a paginated list of therapy sessions.

```
GET /sessions
```

**Query Parameters:**
- `page`: Page number (starts at 1)
- `limit`: Items per page (default: 20, max: 100)
- `clientId`: Filter by client ID
- `therapistId`: Filter by therapist ID
- `status`: Filter by status
- `startDate`: Filter by date range (start)
- `endDate`: Filter by date range (end)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "clientId": 1,
      "therapistId": 1,
      "startTime": "2023-04-05T14:00:00.000Z",
      "endTime": "2023-04-05T15:00:00.000Z",
      "sessionType": "therapy",
      "medium": "in-person",
      "status": "scheduled"
    },
    {...}
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 28,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Get Session by ID

Returns a specific session by ID.

```
GET /sessions/:id
```

**Path Parameters:**
- `id`: Session ID

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "clientId": 1,
    "therapistId": 1,
    "startTime": "2023-04-05T14:00:00.000Z",
    "endTime": "2023-04-05T15:00:00.000Z",
    "sessionType": "therapy",
    "medium": "in-person",
    "status": "scheduled"
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Create Session

Creates a new therapy session.

```
POST /sessions
```

**Request Body:**
```json
{
  "clientId": 1,
  "startTime": "2023-04-10T10:00:00.000Z",
  "endTime": "2023-04-10T11:00:00.000Z",
  "sessionType": "consultation",
  "medium": "video",
  "status": "scheduled"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "clientId": 1,
    "therapistId": 1,
    "startTime": "2023-04-10T10:00:00.000Z",
    "endTime": "2023-04-10T11:00:00.000Z",
    "sessionType": "consultation",
    "medium": "video",
    "status": "scheduled"
  },
  "message": "Session created successfully",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Update Session

Updates an existing therapy session.

```
PATCH /sessions/:id
```

**Path Parameters:**
- `id`: Session ID

**Request Body:**
```json
{
  "startTime": "2023-04-10T14:00:00.000Z",
  "endTime": "2023-04-10T15:00:00.000Z",
  "status": "rescheduled"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "clientId": 1,
    "therapistId": 1,
    "startTime": "2023-04-10T14:00:00.000Z",
    "endTime": "2023-04-10T15:00:00.000Z",
    "sessionType": "consultation",
    "medium": "video",
    "status": "rescheduled"
  },
  "message": "Session updated successfully",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Delete Session

Deletes a therapy session.

```
DELETE /sessions/:id
```

**Path Parameters:**
- `id`: Session ID

**Response:**
```
204 No Content
```

## Documentation

### Get All Documentation

Returns a paginated list of client documentation.

```
GET /documentation
```

**Query Parameters:**
- `page`: Page number (starts at 1)
- `limit`: Items per page (default: 20, max: 100)
- `clientId`: Filter by client ID
- `therapistId`: Filter by therapist ID
- `sessionId`: Filter by session ID
- `type`: Filter by document type
- `status`: Filter by status
- `startDate`: Filter by date range (start)
- `endDate`: Filter by date range (end)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "clientId": 1,
      "therapistId": 1,
      "sessionId": 1,
      "title": "Initial Assessment",
      "content": "Patient presented with symptoms of...",
      "type": "assessment",
      "status": "completed",
      "createdAt": "2023-04-01T12:00:00.000Z",
      "completedAt": "2023-04-01T13:30:00.000Z"
    },
    {...}
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 32,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Get Document by ID

Returns a specific document by ID.

```
GET /documentation/:id
```

**Path Parameters:**
- `id`: Document ID

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "clientId": 1,
    "therapistId": 1,
    "sessionId": 1,
    "title": "Initial Assessment",
    "content": "Patient presented with symptoms of...",
    "type": "assessment",
    "status": "completed",
    "createdAt": "2023-04-01T12:00:00.000Z",
    "completedAt": "2023-04-01T13:30:00.000Z"
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Create Document

Creates a new document.

```
POST /documentation
```

**Request Body:**
```json
{
  "clientId": 1,
  "sessionId": 1,
  "title": "Therapy Progress Notes",
  "content": "Client reported improvement in...",
  "type": "progress_note",
  "status": "draft"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "clientId": 1,
    "therapistId": 1,
    "sessionId": 1,
    "title": "Therapy Progress Notes",
    "content": "Client reported improvement in...",
    "type": "progress_note",
    "status": "draft",
    "createdAt": "2023-04-01T12:34:56.789Z"
  },
  "message": "Document created successfully",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Update Document

Updates an existing document.

```
PATCH /documentation/:id
```

**Path Parameters:**
- `id`: Document ID

**Request Body:**
```json
{
  "content": "Client reported significant improvement in anxiety symptoms...",
  "status": "completed"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "clientId": 1,
    "therapistId": 1,
    "sessionId": 1,
    "title": "Therapy Progress Notes",
    "content": "Client reported significant improvement in anxiety symptoms...",
    "type": "progress_note",
    "status": "completed",
    "createdAt": "2023-04-01T12:34:56.789Z",
    "completedAt": "2023-04-01T14:45:30.000Z"
  },
  "message": "Document updated successfully",
  "timestamp": "2023-04-01T14:45:30.789Z"
}
```

### Delete Document

Deletes a document.

```
DELETE /documentation/:id
```

**Path Parameters:**
- `id`: Document ID

**Response:**
```
204 No Content
```

## Staff

### Get All Staff Members

Returns a paginated list of staff members.

```
GET /staff
```

**Query Parameters:**
- `page`: Page number (starts at 1)
- `limit`: Items per page (default: 20, max: 100)
- `role`: Filter by role
- `status`: Filter by status
- `search`: Search by name, email, or other identifiers

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "therapist",
      "status": "active"
    },
    {...}
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 15,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Get Staff Member by ID

Returns a specific staff member by ID.

```
GET /staff/:id
```

**Path Parameters:**
- `id`: Staff ID

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "therapist",
    "status": "active"
  },
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Create Staff Member

Creates a new staff member.

```
POST /staff
```

**Request Body:**
```json
{
  "firstName": "Alice",
  "lastName": "Brown",
  "email": "alice.brown@example.com",
  "role": "administrator",
  "status": "active"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 3,
    "firstName": "Alice",
    "lastName": "Brown",
    "email": "alice.brown@example.com",
    "role": "administrator",
    "status": "active"
  },
  "message": "Staff member created successfully",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Update Staff Member

Updates an existing staff member.

```
PATCH /staff/:id
```

**Path Parameters:**
- `id`: Staff ID

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 3,
    "firstName": "Alice",
    "lastName": "Brown",
    "email": "alice.brown@example.com",
    "role": "administrator",
    "status": "inactive"
  },
  "message": "Staff member updated successfully",
  "timestamp": "2023-04-01T12:34:56.789Z"
}
```

### Delete Staff Member

Deletes a staff member.

```
DELETE /staff/:id
```

**Path Parameters:**
- `id`: Staff ID

**Response:**
```
204 No Content
```

## HTTP Status Codes

The API uses the following HTTP status codes:

| Code | Description | Example Use Case |
|------|-------------|------------------|
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

## Error Codes

The API uses the following application-specific error codes:

| Code | Description |
|------|-------------|
| AUTHENTICATION_REQUIRED | Authentication is required |
| INVALID_CREDENTIALS | Incorrect username or password |
| ACCOUNT_LOCKED | User account is locked |
| SESSION_EXPIRED | User session has expired |
| INVALID_TOKEN | Invalid or expired token |
| FORBIDDEN | Action is forbidden |
| INSUFFICIENT_PERMISSIONS | User has insufficient permissions |
| RESOURCE_ACCESS_DENIED | Access to the resource is denied |
| RESOURCE_NOT_FOUND | The requested resource was not found |
| RESOURCE_EXISTS | The resource already exists |
| RESOURCE_CONFLICT | The resource conflicts with existing data |
| VALIDATION_ERROR | Request validation failed |
| INVALID_PARAMETER | Invalid parameter provided |
| MISSING_REQUIRED_FIELD | Required field is missing |
| INVALID_FORMAT | Invalid data format |
| DATA_INTEGRITY_ERROR | Data integrity constraint violation |
| OPERATION_FAILED | The requested operation failed |
| RATE_LIMIT_EXCEEDED | Rate limit has been exceeded |
| INTERNAL_SERVER_ERROR | An unexpected server error occurred |
| DATABASE_ERROR | Database operation failed |
| EXTERNAL_SERVICE_ERROR | External service error |

## Changelog

### v1.0.0 (2023-04-01)
- Initial API release 