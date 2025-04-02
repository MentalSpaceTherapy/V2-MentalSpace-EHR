# Manual Installation Guide for Windows

Since you're using Windows, you can follow these manual steps to set up your TypeScript and dependencies properly:

## 1. Install dependencies manually

Run the following commands in your PowerShell terminal:

```powershell
# Install Material UI dependencies
npm install @mui/material @mui/icons-material @mui/lab @mui/system @mui/x-data-grid @mui/x-date-pickers
npm install @emotion/react @emotion/styled

# Install React Router
npm install react-router-dom

# Install other dependencies
npm install axios-cache-interceptor date-fns

# Install dev dependencies
npm install -D @types/react-router-dom
```

## 2. Create necessary directories

Create these directories manually:
- `src/types`
- `src/components/clients/client-forms`
- `src/components/clients/tabs`
- `src/lib`

Or use PowerShell commands:
```powershell
New-Item -ItemType Directory -Path "src/types" -Force
New-Item -ItemType Directory -Path "src/components/clients/client-forms" -Force
New-Item -ItemType Directory -Path "src/components/clients/tabs" -Force
New-Item -ItemType Directory -Path "src/lib" -Force
```

## 3. Create the type declarations file

Create a file at `src/types/global.d.ts` with the following content:

```typescript
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

// Add other necessary type declarations here...
```

## 4. Running the development server

After completing the above steps, you can run the development server:

```powershell
npm run dev
```

The TypeScript configuration has already been updated in the repository, so these steps should resolve the TypeScript errors you were experiencing. 