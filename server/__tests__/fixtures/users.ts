/**
 * User test fixtures
 * 
 * This file contains mock user data for testing purposes.
 * Each user has a different role to test various access control scenarios.
 */

import { Role } from '../../middleware/roleAccess';

export interface MockUser {
  id: number;
  username: string;
  email: string;
  password: string; // Plain text for testing
  firstName: string;
  lastName: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export const admin: MockUser = {
  id: 1,
  username: 'admin',
  email: 'admin@mentalspace.health',
  password: 'Admin123!',
  firstName: 'Admin',
  lastName: 'User',
  role: Role.ADMIN,
  enabled: true,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z'
};

export const practiceAdmin: MockUser = {
  id: 2,
  username: 'practice_admin',
  email: 'practice.admin@mentalspace.health',
  password: 'Practice123!',
  firstName: 'Practice',
  lastName: 'Admin',
  role: Role.PRACTICE_ADMIN,
  enabled: true,
  createdAt: '2023-01-02T00:00:00.000Z',
  updatedAt: '2023-01-02T00:00:00.000Z'
};

export const clinician: MockUser = {
  id: 3,
  username: 'clinician',
  email: 'clinician@mentalspace.health',
  password: 'Clinician123!',
  firstName: 'Test',
  lastName: 'Clinician',
  role: Role.CLINICIAN,
  enabled: true,
  createdAt: '2023-01-03T00:00:00.000Z',
  updatedAt: '2023-01-03T00:00:00.000Z'
};

export const intern: MockUser = {
  id: 4,
  username: 'intern',
  email: 'intern@mentalspace.health',
  password: 'Intern123!',
  firstName: 'Test',
  lastName: 'Intern',
  role: Role.INTERN,
  enabled: true,
  createdAt: '2023-01-04T00:00:00.000Z',
  updatedAt: '2023-01-04T00:00:00.000Z'
};

export const scheduler: MockUser = {
  id: 5,
  username: 'scheduler',
  email: 'scheduler@mentalspace.health',
  password: 'Scheduler123!',
  firstName: 'Test',
  lastName: 'Scheduler',
  role: Role.SCHEDULER,
  enabled: true,
  createdAt: '2023-01-05T00:00:00.000Z',
  updatedAt: '2023-01-05T00:00:00.000Z'
};

export const disabledUser: MockUser = {
  id: 6,
  username: 'disabled',
  email: 'disabled@mentalspace.health',
  password: 'Disabled123!',
  firstName: 'Disabled',
  lastName: 'User',
  role: Role.USER,
  enabled: false,
  createdAt: '2023-01-06T00:00:00.000Z',
  updatedAt: '2023-01-06T00:00:00.000Z'
};

export const allUsers: MockUser[] = [
  admin,
  practiceAdmin,
  clinician,
  intern,
  scheduler,
  disabledUser
];

// For compatibility with imports that use singular/plural naming
export const mockUsers = allUsers;
export const mockUser = admin;

export default {
  admin,
  practiceAdmin,
  clinician,
  intern,
  scheduler,
  disabledUser,
  allUsers,
  mockUsers,
  mockUser
}; 