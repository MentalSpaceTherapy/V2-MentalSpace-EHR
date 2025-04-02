# MentalSpace EHR Testing Infrastructure

This directory contains the testing infrastructure for the MentalSpace EHR system. It is organized into three main types of tests:

## Test Types

### Unit Tests (`unit/`)
Unit tests verify individual components, such as middleware, utilities, and functions in isolation.
These tests mock dependencies and focus on testing specific behaviors.

### Integration Tests (`integration/`)
Integration tests verify that different components work together correctly.
These tests focus on API endpoints, database interactions, and service integrations.

### End-to-End Tests (`e2e/`)
End-to-end tests simulate real user interactions with the system.
These tests verify complete user flows from start to finish.

## Running Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only e2e tests
npm run test:e2e

# Run tests with coverage report
npm run test:coverage
```

## Current Test Coverage

### Completed Tests
- **Unit Tests**
  - Validation middleware
  - Pagination utilities
  - API response utilities
  - Role-based access middleware
  - Client access middleware
  - Basic authentication tests

- **Integration Tests**
  - Auth endpoints (login, logout, register)
  - Client management endpoints

### In Progress
- Error handling middleware tests
- Additional integration tests for remaining endpoints
- End-to-end tests for critical flows

### Planned Tests
- Database interaction tests
- Message/notification tests
- Session management tests
- Report generation tests
- Document management tests

## Test Guidelines

1. **Follow AAA Pattern**: Arrange, Act, Assert
   - Set up the test conditions
   - Execute the code under test
   - Verify the results

2. **Mock External Dependencies**:
   - Use Jest's mocking capabilities
   - Create realistic but controlled test data

3. **Test Edge Cases**:
   - Invalid inputs
   - Authorization edge cases
   - Error conditions

4. **Keep Tests Independent**:
   - Each test should run in isolation
   - Clean up after tests

## Mocking Strategy

### Common Mocks

- **Authentication**: Mock Passport.js and authentication middleware
- **Database**: Mock storage access rather than using a real database
- **External APIs**: Mock API responses for third-party services
- **File System**: Use in-memory file system when testing file operations

## Setting Up Test Data

Test fixtures are available in the `fixtures/` directory for:

- Users with different roles
- Client records
- Sessions and appointments
- Messages and documentation

## Continuous Integration

Tests are automatically run on:
- Pull requests to the main branch
- Before deployments to staging/production

## Troubleshooting Common Issues

- **Authentication Tests**: Ensure mocks properly simulate Passport.js behavior
- **Database Tests**: Reset mock database state between tests
- **API Response Tests**: Check for proper response format and status codes
- **Integration Tests**: Verify proper setup and teardown procedures 