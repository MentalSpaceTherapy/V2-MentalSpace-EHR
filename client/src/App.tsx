import { Switch, Route, useLocation, Redirect, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import PasswordResetPage from "@/pages/password-reset";
import PracticeRegistrationPage from "@/pages/practice-registration";
import ProfileSettingsPage from "@/pages/settings/profile";
import Clients from "@/pages/clients";
import Documentation from "@/pages/documentation";
import DocumentationDashboard from "@/pages/documentation-dashboard";
import DocumentationBulk from "@/pages/documentation-bulk";
import Templates from "@/pages/templates";
import Scheduling from "@/pages/scheduling";
import Messages from "@/pages/messages";
import Billing from "@/pages/billing";
import Reports from "@/pages/reports";
import Practice from "@/pages/practice";
import Telehealth from "@/pages/telehealth";
import SignaturePage from "@/pages/sign";
import Staff from "@/pages/staff";
import StaffFormPage from "./pages/staff-form";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { CRMProvider } from "@/hooks/use-crm";
import CRMIndex from "@/pages/crm";
import CRMDashboard from "@/pages/crm/dashboard";
import CRMCampaigns from "@/pages/crm/campaigns";
import CRMClientAcquisition from "@/pages/crm/client-acquisition";
import CRMMarketing from "@/pages/crm/marketing";
import CRMAnalytics from "@/pages/crm/analytics";
import CRMEvents from "@/pages/crm/events";
import CRMReferralSources from "@/pages/crm/referral-sources";
import CRMContactHistory from "@/pages/crm/contact-history";
import AddStaffPage from "@/pages/add-staff";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { UpdateNotification } from "@/components/pwa/UpdateNotification";
import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa-utils";
import LoginPage from "@/pages/login";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Component to handle the documentation routes and pass the formType
const DocumentationRoute = () => {
  const [location] = useLocation();
  let formType: string | undefined = undefined;
  
  // Extract form type from URL
  if (location.includes("/dashboard")) {
    return <DocumentationDashboard />;
  } else if (location.includes("/intake")) {
    formType = "Intake Form";
  } else if (location.includes("/progress-notes")) {
    formType = "Progress Note";
  } else if (location.includes("/treatment-plans")) {
    formType = "Treatment Plan";
  } else if (location.includes("/contact-notes")) {
    formType = "Contact Note";
  } else if (location.includes("/absence-notes")) {
    formType = "Absence Note";
  } else if (location.includes("/consultations")) {
    formType = "Consultation";
  } else if (location.includes("/miscellaneous")) {
    formType = "Miscellaneous";
  }
  
  return <Documentation formType={formType} />;
};

// Component to wrap CRM related routes with the CRM provider
const CRMRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <CRMProvider>
      {children}
    </CRMProvider>
  );
};

function Router() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Redirect to dashboard if user is logged in and trying to access login page
  if (user && location === "/login") {
    return <Redirect to="/" />;
  }

  return (
    <Switch>
      <Route path="/login">
        <LoginPage />
      </Route>
      <Route path="/password-reset">
        <PasswordResetPage />
      </Route>
      <Route path="/practice-registration">
        <PracticeRegistrationPage />
      </Route>
      <Route path="/sign/:accessUrl">
        <SignaturePage />
      </Route>
      
      {/* Protected Routes */}
      <Route path="/settings/profile">
        <ProtectedRoute>
          <ProfileSettingsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/clients">
        <ProtectedRoute>
          <Clients />
        </ProtectedRoute>
      </Route>
      
      <Route path="/clients/:id">
        <ProtectedRoute>
          <Clients />
        </ProtectedRoute>
      </Route>
      
      {/* Documentation routes */}
      <Route path="/documentation">
        <ProtectedRoute>
          <DocumentationRoute />
        </ProtectedRoute>
      </Route>
      
      <Route path="/documentation/:type">
        <ProtectedRoute>
          <DocumentationRoute />
        </ProtectedRoute>
      </Route>
      
      <Route path="/documentation-bulk">
        <ProtectedRoute>
          <DocumentationBulk />
        </ProtectedRoute>
      </Route>
      
      <Route path="/templates">
        <ProtectedRoute>
          <Templates />
        </ProtectedRoute>
      </Route>
      
      <Route path="/scheduling">
        <ProtectedRoute>
          <Scheduling />
        </ProtectedRoute>
      </Route>
      
      <Route path="/messages">
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      </Route>
      
      {/* CRM routes with CRM provider */}
      <Route path="/crm">
        <ProtectedRoute requiredRoles={["administrator", "therapist"]}>
          <CRMRoute>
            <CRMIndex />
          </CRMRoute>
        </ProtectedRoute>
      </Route>
      
      <Route path="/crm/dashboard">
        <ProtectedRoute requiredRoles={["administrator", "therapist"]}>
          <CRMRoute>
            <CRMDashboard />
          </CRMRoute>
        </ProtectedRoute>
      </Route>
      
      <Route path="/crm/campaigns">
        <ProtectedRoute requiredRoles={["administrator", "therapist"]}>
          <CRMRoute>
            <CRMCampaigns />
          </CRMRoute>
        </ProtectedRoute>
      </Route>
      
      <Route path="/crm/client-acquisition">
        <ProtectedRoute requiredRoles={["administrator", "therapist"]}>
          <CRMRoute>
            <CRMClientAcquisition />
          </CRMRoute>
        </ProtectedRoute>
      </Route>
      
      <Route path="/crm/marketing">
        <ProtectedRoute requiredRoles={["administrator", "therapist"]}>
          <CRMRoute>
            <CRMMarketing />
          </CRMRoute>
        </ProtectedRoute>
      </Route>
      
      <Route path="/crm/analytics">
        <ProtectedRoute requiredRoles={["administrator", "therapist"]}>
          <CRMRoute>
            <CRMAnalytics />
          </CRMRoute>
        </ProtectedRoute>
      </Route>
      
      <Route path="/crm/events">
        <ProtectedRoute requiredRoles={["administrator", "therapist"]}>
          <CRMRoute>
            <CRMEvents />
          </CRMRoute>
        </ProtectedRoute>
      </Route>
      
      <Route path="/crm/referral-sources">
        <ProtectedRoute requiredRoles={["administrator", "therapist"]}>
          <CRMRoute>
            <CRMReferralSources />
          </CRMRoute>
        </ProtectedRoute>
      </Route>
      
      <Route path="/crm/contact-history">
        <ProtectedRoute requiredRoles={["administrator", "therapist"]}>
          <CRMRoute>
            <CRMContactHistory />
          </CRMRoute>
        </ProtectedRoute>
      </Route>
      
      <Route path="/billing">
        <ProtectedRoute requiredRoles={["administrator", "biller"]}>
          <Billing />
        </ProtectedRoute>
      </Route>
      
      <Route path="/reports">
        <ProtectedRoute requiredRoles={["administrator"]}>
          <Reports />
        </ProtectedRoute>
      </Route>
      
      <Route path="/practice">
        <ProtectedRoute requiredRoles={["administrator"]}>
          <Practice />
        </ProtectedRoute>
      </Route>
      
      <Route path="/telehealth">
        <ProtectedRoute>
          <Telehealth />
        </ProtectedRoute>
      </Route>
      
      <Route path="/staff">
        <ProtectedRoute requiredRoles={["administrator"]}>
          <Staff />
        </ProtectedRoute>
      </Route>
      
      <Route path="/add-staff">
        <ProtectedRoute requiredRoles={["administrator"]}>
          <AddStaffPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/staff-form">
        <ProtectedRoute requiredRoles={["administrator"]}>
          <StaffFormPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/staff-new">
        <ProtectedRoute requiredRoles={["administrator"]}>
          {(() => {
            const StaffNewPage = require("./pages/staff-new").default;
            return <StaffNewPage />;
          })()}
        </ProtectedRoute>
      </Route>
      
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  // Register service worker when the app loads
  useEffect(() => {
    registerServiceWorker()
      .then((success) => {
        // Service worker registration handled silently
      })
      .catch(() => {
        // Errors are handled silently in production
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base="/">
          <Router />
          <Toaster />
          <InstallPrompt />
          <UpdateNotification />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
