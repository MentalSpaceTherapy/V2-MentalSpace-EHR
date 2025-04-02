import Fuse from 'fuse.js';
import { addDays, parseISO, isWithinInterval, isValid, differenceInYears } from 'date-fns';

// Interface for the client object structure
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  status: string;
  nextAppointment?: string | null;
  primaryTherapistName?: string | null;
  primaryTherapistId?: string | null;
  lastAppointment?: string | null;
  insuranceProvider?: string | null;
  tags?: string[];
  alerts?: any[];
  unpaidBalance?: number;
  gender?: string;
  maritalStatus?: string;
  diagnosisCodes?: string[];
  diagnoses?: any[];
  address?: any;
  emergencyContact?: any;
  insuranceDetails?: any;
  employmentStatus?: string;
  createdAt?: string | null;
}

// Interface for search criteria
export interface ClientSearchCriteria {
  searchTerm?: string;
  statuses?: string[];
  therapistIds?: string[];
  insuranceProviders?: string[];
  tags?: string[];
  diagnosisCodes?: string[];
  ageRange?: {
    min?: number;
    max?: number;
  };
  gender?: string[];
  maritalStatus?: string[];
  upcomingBirthday?: boolean;
  upcomingAppointment?: boolean;
  nextDays?: number;
  hasUnpaidBalance?: boolean;
  balanceMin?: number;
  balanceMax?: number;
  newIntakes?: boolean;
  lastSessionDays?: number;
  isDischarging?: boolean;
  employmentStatus?: string[];
  savedFilterId?: string;
  dateRange?: {
    start?: Date | null;
    end?: Date | null;
    field?: 'nextAppointment' | 'lastAppointment' | 'dateOfBirth' | 'createdAt';
  };
}

// Default fuzzy search options
const DEFAULT_FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.3,
  ignoreLocation: true,
  keys: [
    {
      name: 'firstName',
      weight: 2
    },
    {
      name: 'lastName', 
      weight: 2
    },
    'email',
    'phone',
    'insuranceProvider',
    'primaryTherapistName',
    'tags',
    {
      name: 'address.street',
      weight: 1
    },
    {
      name: 'address.city',
      weight: 1
    },
    {
      name: 'diagnosisCodes',
      weight: 1.5
    }
  ]
};

export class ClientSearchService {
  // Initialize Fuse instance
  private fuse: Fuse<Client>;
  private clients: Client[];

  constructor(clients: Client[]) {
    this.clients = clients;
    this.fuse = new Fuse(clients, DEFAULT_FUSE_OPTIONS);
  }

  // Search clients with fuzzy matching
  public search(criteria: ClientSearchCriteria): Client[] {
    let results: Client[] = this.clients;

    // Use fuzzy search if there's a search term
    if (criteria.searchTerm && criteria.searchTerm.trim() !== '') {
      const fuseResults = this.fuse.search(criteria.searchTerm);
      results = fuseResults.map(result => result.item);
    }

    // Apply additional filters
    return this.applyFilters(results, criteria);
  }

  // Apply filters to search results
  private applyFilters(clients: Client[], criteria: ClientSearchCriteria): Client[] {
    return clients.filter(client => {
      // Filter by status
      if (criteria.statuses && criteria.statuses.length > 0) {
        if (!client.status || !criteria.statuses.includes(client.status)) {
          return false;
        }
      }

      // Filter by therapist
      if (criteria.therapistIds && criteria.therapistIds.length > 0) {
        if (!client.primaryTherapistId || !criteria.therapistIds.includes(client.primaryTherapistId)) {
          return false;
        }
      }

      // Filter by insurance provider
      if (criteria.insuranceProviders && criteria.insuranceProviders.length > 0) {
        if (!client.insuranceProvider || !criteria.insuranceProviders.includes(client.insuranceProvider)) {
          return false;
        }
      }

      // Filter by tags
      if (criteria.tags && criteria.tags.length > 0) {
        if (!client.tags || !criteria.tags.some(tag => client.tags?.includes(tag))) {
          return false;
        }
      }

      // Filter by diagnosis codes
      if (criteria.diagnosisCodes && criteria.diagnosisCodes.length > 0) {
        // Check if the client has any of the specified diagnosis codes
        const clientDiagnosisCodes = this.getClientDiagnosisCodes(client);
        if (!clientDiagnosisCodes.some(code => criteria.diagnosisCodes?.includes(code))) {
          return false;
        }
      }

      // Filter by age range
      if (criteria.ageRange && (criteria.ageRange.min !== undefined || criteria.ageRange.max !== undefined)) {
        if (!client.dateOfBirth) {
          return false;
        }
        
        const birthDate = parseISO(client.dateOfBirth);
        if (!isValid(birthDate)) {
          return false;
        }
        
        const age = differenceInYears(new Date(), birthDate);
        
        if (criteria.ageRange.min !== undefined && age < criteria.ageRange.min) {
          return false;
        }
        
        if (criteria.ageRange.max !== undefined && age > criteria.ageRange.max) {
          return false;
        }
      }

      // Filter by gender
      if (criteria.gender && criteria.gender.length > 0) {
        if (!client.gender || !criteria.gender.includes(client.gender)) {
          return false;
        }
      }

      // Filter by marital status
      if (criteria.maritalStatus && criteria.maritalStatus.length > 0) {
        if (!client.maritalStatus || !criteria.maritalStatus.includes(client.maritalStatus)) {
          return false;
        }
      }

      // Filter by upcoming birthday (next 30 days)
      if (criteria.upcomingBirthday) {
        if (!client.dateOfBirth) {
          return false;
        }
        
        const result = this.hasUpcomingBirthday(client.dateOfBirth);
        if (!result) {
          return false;
        }
      }

      // Filter by upcoming appointment in next X days
      if (criteria.upcomingAppointment) {
        const days = criteria.nextDays || 7; // Default to 7 days if not specified
        
        if (!client.nextAppointment) {
          return false;
        }
        
        const appointmentDate = parseISO(client.nextAppointment);
        const now = new Date();
        const future = addDays(now, days);
        
        if (!isValid(appointmentDate) || !isWithinInterval(appointmentDate, { start: now, end: future })) {
          return false;
        }
      }

      // Filter by unpaid balance
      if (criteria.hasUnpaidBalance) {
        if (client.unpaidBalance === undefined || client.unpaidBalance <= 0) {
          return false;
        }
      }

      // Filter by balance range
      if (criteria.balanceMin !== undefined || criteria.balanceMax !== undefined) {
        if (client.unpaidBalance === undefined) {
          return false;
        }
        
        if (criteria.balanceMin !== undefined && client.unpaidBalance < criteria.balanceMin) {
          return false;
        }
        
        if (criteria.balanceMax !== undefined && client.unpaidBalance > criteria.balanceMax) {
          return false;
        }
      }

      // Filter by new intakes (client status is onboarding)
      if (criteria.newIntakes) {
        if (client.status !== 'onboarding') {
          return false;
        }
      }

      // Filter by clients who haven't had a session in X days
      if (criteria.lastSessionDays !== undefined) {
        if (!client.lastAppointment) {
          // If no last appointment, they qualify (it's been "infinite" days)
          return true;
        }
        
        const lastAppointmentDate = parseISO(client.lastAppointment);
        const now = new Date();
        const daysAgo = addDays(now, -criteria.lastSessionDays);
        
        if (!isValid(lastAppointmentDate) || lastAppointmentDate > daysAgo) {
          return false;
        }
      }

      // Filter by employment status
      if (criteria.employmentStatus && criteria.employmentStatus.length > 0) {
        if (!client.employmentStatus || !criteria.employmentStatus.includes(client.employmentStatus)) {
          return false;
        }
      }

      // Filter by date range for a specific field
      if (criteria.dateRange && criteria.dateRange.field) {
        const { field, start, end } = criteria.dateRange;
        if (!start && !end) {
          return true; // No date filter if both dates are null
        }
        
        const fieldValue = client[field];
        if (!fieldValue) {
          return false;
        }
        
        const date = parseISO(fieldValue);
        if (!isValid(date)) {
          return false;
        }
        
        if (start && end) {
          return isWithinInterval(date, { start, end });
        } else if (start) {
          return date >= start;
        } else if (end) {
          return date <= end;
        }
      }

      // Client passed all filters
      return true;
    });
  }

  // Helper method to check if a client has an upcoming birthday in the next 30 days
  private hasUpcomingBirthday(dateOfBirthStr: string): boolean {
    const dateOfBirth = parseISO(dateOfBirthStr);
    if (!isValid(dateOfBirth)) {
      return false;
    }
    
    const today = new Date();
    const nextMonth = addDays(today, 30);
    
    // Create birthday for this year
    const birthdayThisYear = new Date(today.getFullYear(), dateOfBirth.getMonth(), dateOfBirth.getDate());
    
    // If birthday has already passed this year, check next year
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(today.getFullYear() + 1);
    }
    
    return isWithinInterval(birthdayThisYear, { start: today, end: nextMonth });
  }

  // Helper method to extract diagnosis codes from a client
  private getClientDiagnosisCodes(client: Client): string[] {
    if (client.diagnosisCodes && Array.isArray(client.diagnosisCodes)) {
      return client.diagnosisCodes;
    }
    
    if (client.diagnoses && Array.isArray(client.diagnoses)) {
      return client.diagnoses.map(d => d.code || '').filter(Boolean);
    }
    
    return [];
  }

  // Export search results to CSV
  public exportToCsv(clients: Client[]): string {
    if (clients.length === 0) {
      return '';
    }
    
    // Define CSV columns
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Date of Birth',
      'Status',
      'Primary Therapist',
      'Insurance Provider',
      'Unpaid Balance',
      'Next Appointment',
      'Last Appointment',
      'Tags',
      'Diagnoses'
    ];
    
    // Create CSV content
    const csvRows = [
      headers.join(','), // Header row
      ...clients.map(client => {
        const row = [
          client.id,
          this.escapeCsvValue(client.firstName),
          this.escapeCsvValue(client.lastName),
          this.escapeCsvValue(client.email || ''),
          this.escapeCsvValue(client.phone || ''),
          client.dateOfBirth || '',
          this.escapeCsvValue(client.status),
          this.escapeCsvValue(client.primaryTherapistName || ''),
          this.escapeCsvValue(client.insuranceProvider || ''),
          client.unpaidBalance !== undefined ? client.unpaidBalance.toString() : '',
          client.nextAppointment || '',
          client.lastAppointment || '',
          this.escapeCsvValue((client.tags || []).join('; ')),
          this.escapeCsvValue(this.getClientDiagnosisCodes(client).join('; '))
        ];
        
        return row.join(',');
      })
    ];
    
    return csvRows.join('\n');
  }

  // Helper to escape values for CSV
  private escapeCsvValue(value: string): string {
    if (!value) return '';
    
    // If the value contains commas, quotes, or newlines, wrap it in quotes
    const needsQuotes = /[",\n\r]/.test(value);
    
    if (needsQuotes) {
      // Replace any quotes with double quotes (standard CSV escaping)
      const escaped = value.replace(/"/g, '""');
      return `"${escaped}"`;
    }
    
    return value;
  }
}

export default ClientSearchService; 