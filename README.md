# Mental Space EHR Dashboard

A comprehensive Electronic Health Record (EHR) system for mental health professionals, built with React, TypeScript, and Node.js.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MentalHealthDashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mental_space_ehr

# Session Configuration
SESSION_SECRET=your_session_secret

# Email Configuration (Optional)
SENDGRID_API_KEY=your_sendgrid_api_key
```

### 4. Database Setup

1. Create a PostgreSQL database:
```bash
createdb mental_space_ehr
```

2. Run database migrations:
```bash
npm run db:push
```

3. Generate database types:
```bash
npm run db:generate
```

### 5. Start Development Servers

Run both client and server in development mode:
```bash
npm run dev
```

This will start:
- Client: http://localhost:5173
- Server: http://localhost:3001

Alternatively, you can run them separately:
```bash
# Client only
npm run dev:client

# Server only
npm run dev:server
```

## Available Scripts

### Development
- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start client development server
- `npm run dev:server` - Start server development server

### Database
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate database types
- `npm run db:studio` - Open Drizzle Studio for database management

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Build & Production
- `npm run build` - Build both client and server
- `npm start` - Start production server

## Project Structure

```
MentalHealthDashboard/
├── src/                    # Client-side source code
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   └── __tests__/        # Client-side tests
├── server/               # Server-side source code
│   ├── db/              # Database configuration
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   └── __tests__/       # Server-side tests
├── public/              # Static assets
└── dist/               # Build output
```

## Common Issues and Solutions

### Database Connection Issues

1. **Error: Connection refused**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env
   - Verify database exists

2. **Error: Schema not found**
   - Run `npm run db:push`
   - Check database permissions

### Development Server Issues

1. **Port already in use**
   - Kill the process using the port
   - Or change the port in .env

2. **Hot reload not working**
   - Clear browser cache
   - Restart development server

### Build Issues

1. **TypeScript errors**
   - Run `npm run check`
   - Fix type errors in code
   - Update type definitions if needed

2. **Build fails**
   - Clear node_modules and reinstall
   - Check for conflicting dependencies
   - Verify environment variables

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Testing

The MentalSpace EHR system includes comprehensive testing to ensure code quality and functionality:

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run end-to-end tests
npm run test:e2e

# Run tests in watch mode (during development)
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Test individual functions and components in isolation
  - Backend: `server/__tests__/unit/`
  - Frontend: `client/src/**/*.test.tsx`

- **Integration Tests**: Test API endpoints and interactions between modules
  - Located in `server/__tests__/integration/`

- **End-to-End Tests**: Test complete user workflows through the system
  - Located in `server/__tests__/e2e/`

### Writing Tests

#### Backend Tests (Jest)

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Feature name', () => {
  it('should do something specific', () => {
    // Test code
    expect(result).toBe(expectedValue);
  });
});
```

#### Frontend Tests (Vitest)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Mocking

The test suite uses mocks to isolate components and functions during testing:

- **Backend**: Jest mocks for functions, databases, and external services
- **Frontend**: Vitest mocks for hooks, API calls, and router
- **MSW**: Mock Service Worker for intercepting API requests in frontend tests

### Test Database

End-to-end and some integration tests use a dedicated test database:

```
# Test database connection string (in .env.test)
DATABASE_URL=postgresql://postgres:test@localhost:5432/mental_space_ehr_test
```

Ensure this database exists and is properly seeded before running tests.

### Continuous Integration

The project uses GitHub Actions for continuous integration. The CI pipeline automatically runs on every push to the main branches and on pull requests.

#### CI Pipeline Features

- **Automated Testing**: Runs unit, integration, and frontend tests
- **Code Quality**: Lints the code to ensure coding standards
- **Database Testing**: Spins up a PostgreSQL database for integration tests
- **Build Verification**: Ensures the application builds correctly
- **Coverage Reports**: Generates and uploads test coverage reports

#### CI Configuration

The CI configuration is defined in `.github/workflows/ci.yml`. It includes:

1. **Test Job**:
   - Sets up Node.js and PostgreSQL
   - Installs dependencies
   - Creates test environment configuration
   - Runs migrations on test database
   - Executes all test suites
   - Generates and uploads coverage reports

2. **Build Job**:
   - Runs after tests pass
   - Builds the production application
   - Archives build artifacts

#### Running Locally

You can simulate the CI pipeline locally before pushing changes:

```bash
# Lint code
npm run lint

# Run all tests
npm test

# Build the application
npm run build
```

## Continuous Integration/Continuous Deployment

The project uses GitHub Actions for CI/CD. The enhanced pipeline automatically runs on every push to main branches and on pull requests.

### CI/CD Pipeline Overview

#### Pull Request Checks

When you create or update a pull request:

1. **PR Tests Workflow** (`.github/workflows/pr-tests.yml`):
   - Analyzes changed files to determine what tests to run
   - Runs tests only for affected areas (server, client, etc.)
   - Leaves a comment on the PR with test results
   - Makes PR testing faster by focusing only on affected components

2. **Full CI Pipeline** (`.github/workflows/ci.yml`):
   - Runs validation steps (linting, type checking)
   - Runs all test suites (unit, integration, E2E)
   - Builds the application
   - Provides feedback on the PR with results

### Running CI Tests Locally

You can simulate the CI environment locally before committing changes:

```bash
# Type checking
npm run test:types

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Everything at once (as in CI)
npm run test:ci
```

### Setting Up Test Environment

For local development, you can set up a test environment by:

1. Creating a test database:
   ```bash
   createdb mental_space_ehr_test
   ```

2. Setting up a `.env.test` file:
   ```env
   NODE_ENV=test
   PORT=3001
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mental_space_ehr_test
   SESSION_SECRET=test_secret_key
   JWT_SECRET=test_jwt_secret
   ```

3. Running test migrations:
   ```bash
   NODE_ENV=test npm run db:migrate
   ```

### Creating Pull Requests

When creating pull requests:

1. Ensure all tests pass locally before submitting
2. Address any issues reported by the CI pipeline
3. Wait for PR tests to complete before asking for review
4. Include test coverage for new features

The CI pipeline will automatically:
- Check code quality
- Run relevant tests
- Report results directly on your PR
- Verify successful application build 

## Error Handling System

The MentalSpace EHR application implements a comprehensive error handling system that provides consistent error management across both the frontend and backend.

### Backend Error Handling

The backend uses a standardized API error format:

```typescript
{
  status: 'error',
  message: string,
  code: string,
  requestId?: string,
  path: string,
  method: string,
  timestamp: string,
  details?: any
}
```

Key components:

- **Centralized API Error Module** - Found in `server/utils/api-error.ts`
- **Error Handling Middleware** - Found in `server/middleware/errorHandler.ts`
- **Standardized Error Types** - Enumerated in `ErrorCode` enum
- **Error Response Utilities** - Includes specific error creation helpers

### Frontend Error Handling

The frontend error handling system complements the backend system and provides:

- **Standardized Error Parsing** - Converts any error to a consistent format
- **Error Type Classification** - Maps backend error codes to frontend error types
- **Toast Notifications** - User-friendly error messages
- **Error Logging** - Consistent console logging for debugging

Key components:

- **Error Handler Utility** - Found in `src/utils/errorHandler.ts`
- **API Request Utility** - Found in `src/utils/apiRequest.ts`
- **Error Handling Hook** - `useApiError` hook for React components

### Using the Error Handling System

1. **In API Calls**:

```typescript
import { apiRequest } from '../utils/apiRequest';

try {
  const response = await apiRequest('GET', '/api/clients');
  const data = await response.json();
  // Handle success
} catch (error) {
  // Error is already formatted consistently
  console.error(error);
}
```

2. **With the useApiError Hook**:

```typescript
import { useApiError } from '../hooks/useApiError';

function MyComponent() {
  const { handleApiCall, error, isLoading } = useApiError();
  
  const fetchData = async () => {
    await handleApiCall(
      async () => {
        const response = await apiRequest('GET', '/api/data');
        return await response.json();
      },
      {
        onSuccess: (data) => {
          // Handle success
        },
        showToast: true
      }
    );
  };
  
  return (
    <div>
      {isLoading && <Spinner />}
      {error && <ErrorDisplay error={error} />}
      <Button onClick={fetchData}>Fetch Data</Button>
    </div>
  );
}
```

3. **For Displaying Errors**:

```typescript
import { showErrorToast } from '../utils/errorHandler';

// Show an error toast with standardized formatting
showErrorToast(error);
```

This error handling system ensures that errors are consistently processed, displayed, and logged throughout the application. 