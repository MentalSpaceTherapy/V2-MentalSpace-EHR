export interface Staff {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roles: string[];
  status: string;
  typeOfClinician?: string;
  npiNumber?: string;
  licenseNumber?: string;
  formalName?: string;
  title?: string;
  phone?: string;
  canReceiveSMS?: boolean;
  workPhone?: string;
  homePhone?: string;
  address?: string;
  cityState?: string;
  zipCode?: string;
  licenseState?: string;
  licenseType?: string;
  licenseExpiration?: string;
  supervisorId?: number;
  languages?: string[];
  profileImage?: string;
} 