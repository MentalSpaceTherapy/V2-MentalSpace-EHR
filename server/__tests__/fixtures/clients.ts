/**
 * Client test fixtures
 * 
 * This file contains mock client data for testing purposes.
 * These clients are associated with different therapists to test access control.
 */

export interface MockClient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  insuranceProvider?: string;
  insuranceId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  primaryTherapistId: number;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Client assigned to Clinician (User ID: 3)
export const client1: MockClient = {
  id: 101,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '555-123-4567',
  dateOfBirth: '1985-06-15',
  address: '123 Main St',
  city: 'Anytown',
  state: 'CA',
  zipCode: '90210',
  insuranceProvider: 'Blue Cross',
  insuranceId: 'BC12345678',
  emergencyContactName: 'Jane Doe',
  emergencyContactPhone: '555-987-6543',
  primaryTherapistId: 3, // Clinician user
  status: 'active',
  createdAt: '2023-02-01T00:00:00.000Z',
  updatedAt: '2023-02-01T00:00:00.000Z',
  notes: 'Regular weekly sessions'
};

// Another client assigned to Clinician (User ID: 3)
export const client2: MockClient = {
  id: 102,
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@example.com',
  phoneNumber: '555-222-3333',
  dateOfBirth: '1990-08-21',
  address: '456 Elm St',
  city: 'Metropolis',
  state: 'NY',
  zipCode: '10001',
  insuranceProvider: 'Aetna',
  insuranceId: 'AE98765432',
  emergencyContactName: 'Michael Johnson',
  emergencyContactPhone: '555-444-5555',
  primaryTherapistId: 3, // Clinician user
  status: 'active',
  createdAt: '2023-02-15T00:00:00.000Z',
  updatedAt: '2023-02-15T00:00:00.000Z',
  notes: 'Bi-weekly sessions, anxiety management'
};

// Client assigned to Intern (User ID: 4)
export const client3: MockClient = {
  id: 103,
  firstName: 'Robert',
  lastName: 'Smith',
  email: 'robert.smith@example.com',
  phoneNumber: '555-333-4444',
  dateOfBirth: '1978-11-30',
  address: '789 Oak Dr',
  city: 'Smallville',
  state: 'IL',
  zipCode: '60601',
  insuranceProvider: 'United Healthcare',
  insuranceId: 'UH45678901',
  emergencyContactName: 'Mary Smith',
  emergencyContactPhone: '555-666-7777',
  primaryTherapistId: 4, // Intern user
  status: 'active',
  createdAt: '2023-03-01T00:00:00.000Z',
  updatedAt: '2023-03-01T00:00:00.000Z',
  notes: 'Weekly sessions, supervised by User ID 3'
};

// Inactive client assigned to Clinician (User ID: 3)
export const inactiveClient: MockClient = {
  id: 104,
  firstName: 'Emily',
  lastName: 'Wilson',
  email: 'emily.wilson@example.com',
  phoneNumber: '555-888-9999',
  dateOfBirth: '1982-04-10',
  address: '321 Pine Rd',
  city: 'Liberty',
  state: 'TX',
  zipCode: '75001',
  insuranceProvider: 'Cigna',
  insuranceId: 'CI13579246',
  emergencyContactName: 'William Wilson',
  emergencyContactPhone: '555-111-2222',
  primaryTherapistId: 3, // Clinician user
  status: 'inactive',
  createdAt: '2023-01-10T00:00:00.000Z',
  updatedAt: '2023-04-01T00:00:00.000Z',
  notes: 'Treatment completed. Follow-up in 3 months.'
};

// All clients
export const allClients: MockClient[] = [
  client1,
  client2,
  client3,
  inactiveClient
];

// For compatibility with imports that use different naming
export const mockClients = allClients;
export const mockClient = client1;

// Get clients by therapist ID
export const getClientsByTherapistId = (therapistId: number): MockClient[] => {
  return allClients.filter(client => client.primaryTherapistId === therapistId);
};

// Get clients by status
export const getClientsByStatus = (status: 'active' | 'inactive' | 'archived'): MockClient[] => {
  return allClients.filter(client => client.status === status);
};

export default {
  client1,
  client2,
  client3,
  inactiveClient,
  allClients,
  mockClients,
  mockClient,
  getClientsByTherapistId,
  getClientsByStatus
}; 