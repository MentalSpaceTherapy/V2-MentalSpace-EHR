# PowerShell setup script for Windows

# Create the necessary directories
$directories = @(
    "src/types",
    "src/components/clients/client-forms",
    "src/components/clients/tabs",
    "src/lib",
    "src/components/client/history",
    "src/components/lookup"
)

Write-Host "Creating required directories..." -ForegroundColor Cyan
foreach ($dir in $directories) {
    $path = Join-Path -Path $PSScriptRoot -ChildPath $dir
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  Already exists: $dir" -ForegroundColor Yellow
    }
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan

# Create type declarations file
$typesPath = Join-Path -Path $PSScriptRoot -ChildPath "src/types/global.d.ts"
Write-Host "Creating type declarations file: $typesPath" -ForegroundColor Cyan

$typeDeclarations = @'
/**
 * Global type declarations for the MentalSpace EHR application
 */

// Declare axios instance
declare module '../lib/axios' {
  import { AxiosInstance } from 'axios';
  export const axios: AxiosInstance;
}

// Declare missing or custom components
declare module '../components/PageHeader' {
  export interface PageHeaderProps {
    title: React.ReactNode;
    actions?: React.ReactNode;
    description?: React.ReactNode;
    breadcrumbs?: Array<{
      label: string;
      href: string;
    }>;
  }
  
  export const PageHeader: React.FC<PageHeaderProps>;
}

declare module '../components/LoadingSpinner' {
  export interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
  }
  
  export const LoadingSpinner: React.FC<LoadingSpinnerProps>;
}

declare module '../components/ErrorMessage' {
  export interface ErrorMessageProps {
    error: Error;
    onRetry?: () => void;
  }
  
  export const ErrorMessage: React.FC<ErrorMessageProps>;
}

// Declare client component types
declare module '../components/clients/ClientFilterDrawer' {
  export interface ClientFilterDrawerProps {
    open: boolean;
    onClose: () => void;
    filters: any;
    onApplyFilters: (filters: any) => void;
  }
  
  export const ClientFilterDrawer: React.FC<ClientFilterDrawerProps>;
}

declare module '../components/clients/AddClientModal' {
  export interface AddClientModalProps {
    open: boolean;
    onClose: () => void;
    onClientAdded: (client: any) => void;
  }
  
  export const AddClientModal: React.FC<AddClientModalProps>;
}

declare module '../components/clients/ClientStatusBadge' {
  export interface ClientStatusBadgeProps {
    status: string;
    size?: 'small' | 'medium';
  }
  
  export const ClientStatusBadge: React.FC<ClientStatusBadgeProps>;
}

declare module '../components/clients/ClientTimeline' {
  export interface TimelineEvent {
    id: number;
    date: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    user: string;
    metadata?: any;
  }
  
  export interface ClientTimelineProps {
    events: TimelineEvent[];
  }
  
  export const ClientTimeline: React.FC<ClientTimelineProps>;
}

// Declare client tab types
declare module '../components/clients/tabs/ClientDemographicsTab' {
  export interface ClientDemographicsTabProps {
    client: any;
  }
  
  export const ClientDemographicsTab: React.FC<ClientDemographicsTabProps>;
}

declare module '../components/clients/tabs/ClientInsuranceTab' {
  export interface ClientInsuranceTabProps {
    client: any;
  }
  
  export const ClientInsuranceTab: React.FC<ClientInsuranceTabProps>;
}

declare module '../components/clients/tabs/ClientClinicalTab' {
  export interface ClientClinicalTabProps {
    client: any;
  }
  
  export const ClientClinicalTab: React.FC<ClientClinicalTabProps>;
}

declare module '../components/clients/tabs/ClientAppointmentsTab' {
  export interface ClientAppointmentsTabProps {
    clientId?: string;
  }
  
  export const ClientAppointmentsTab: React.FC<ClientAppointmentsTabProps>;
}

declare module '../components/clients/tabs/ClientDocumentsTab' {
  export interface ClientDocumentsTabProps {
    clientId?: string;
  }
  
  export const ClientDocumentsTab: React.FC<ClientDocumentsTabProps>;
}

declare module '../components/clients/tabs/ClientBillingTab' {
  export interface ClientBillingTabProps {
    clientId?: string;
  }
  
  export const ClientBillingTab: React.FC<ClientBillingTabProps>;
}

declare module '../components/clients/tabs/ClientNotesTab' {
  export interface ClientNotesTabProps {
    clientId?: string;
  }
  
  export const ClientNotesTab: React.FC<ClientNotesTabProps>;
}

declare module '../components/clients/tabs/ClientHistoryTab' {
  export interface ClientHistoryTabProps {
    clientId?: string;
  }
  
  export const ClientHistoryTab: React.FC<ClientHistoryTabProps>;
}

// Declare hook types
declare module '../hooks/useAuth' {
  export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }
  
  export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: any) => Promise<void>;
    error: string | null;
  }
  
  export function useAuth(): AuthContextType;
}
'@

Set-Content -Path $typesPath -Value $typeDeclarations

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "Try running 'npm run dev' to start the application." -ForegroundColor Green 