import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import { Box, Typography, Container, Paper } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PageLayout } from './components/layout/PageLayout';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import ClientStatusBadge from './components/clients/ClientStatusBadge';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Demo home page
const Home = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        MentalSpace EHR - Dashboard
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Client Status Badges
        </Typography>
        <Typography variant="body1" paragraph>
          These badges are used to visually indicate a client's status throughout the application.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <ClientStatusBadge status="active" />
          <ClientStatusBadge status="onboarding" />
          <ClientStatusBadge status="inactive" />
          <ClientStatusBadge status="on-hold" />
          <ClientStatusBadge status="discharged" />
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Implementation Progress
        </Typography>
        <Typography variant="body1" paragraph>
          We've successfully implemented and configured:
        </Typography>
        <ul>
          <li>Client data model with comprehensive fields</li>
          <li>Side navigation with core EHR features</li>
          <li>TypeScript configuration with proper type definitions</li>
          <li>UI components for client management</li>
          <li>GitHub Pages deployment pipeline</li>
        </ul>
        <Typography variant="body1">
          Try the Clients menu item to see the full client management interface.
        </Typography>
      </Paper>
    </Container>
  );
};

// Placeholder components for menu items that aren't implemented yet
const Documentation = () => (
  <Container maxWidth="lg">
    <Typography variant="h4" gutterBottom>Documentation</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography>Documentation module will be implemented soon.</Typography>
    </Paper>
  </Container>
);

const Scheduling = () => (
  <Container maxWidth="lg">
    <Typography variant="h4" gutterBottom>Scheduling</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography>Scheduling module will be implemented soon.</Typography>
    </Paper>
  </Container>
);

const Messages = () => (
  <Container maxWidth="lg">
    <Typography variant="h4" gutterBottom>Messages</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography>Messages module will be implemented soon.</Typography>
    </Paper>
  </Container>
);

const Billing = () => (
  <Container maxWidth="lg">
    <Typography variant="h4" gutterBottom>Billing</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography>Billing module will be implemented soon.</Typography>
    </Paper>
  </Container>
);

const Reports = () => (
  <Container maxWidth="lg">
    <Typography variant="h4" gutterBottom>Reports</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography>Reports module will be implemented soon.</Typography>
    </Paper>
  </Container>
);

const CRM = () => (
  <Container maxWidth="lg">
    <Typography variant="h4" gutterBottom>CRM</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography>CRM module will be implemented soon.</Typography>
    </Paper>
  </Container>
);

const Staff = () => (
  <Container maxWidth="lg">
    <Typography variant="h4" gutterBottom>Staff</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography>Staff management module will be implemented soon.</Typography>
    </Paper>
  </Container>
);

const Settings = () => (
  <Container maxWidth="lg">
    <Typography variant="h4" gutterBottom>Practice Settings</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography>Practice settings module will be implemented soon.</Typography>
    </Paper>
  </Container>
);

// Main App Component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <PageLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/scheduling" element={<Scheduling />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<div><Typography variant="h4" sx={{ m: 4 }}>Page Not Found</Typography></div>} />
          </Routes>
        </PageLayout>
      </HashRouter>
    </QueryClientProvider>
  );
};

export default App; 