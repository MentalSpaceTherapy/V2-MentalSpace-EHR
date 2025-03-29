import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard"; // Using our updated dashboard
import AuthPage from "@/pages/auth-page";
import PasswordResetPage from "@/pages/password-reset";
import PracticeRegistrationPage from "@/pages/practice-registration";
import ProfileSettingsPage from "@/pages/settings/profile";
import Clients from "@/pages/clients";
import Documentation from "@/pages/documentation";
import DocumentationDashboard from "@/pages/documentation-dashboard";
import Templates from "@/pages/templates";
import Scheduling from "@/pages/scheduling";
import Messages from "@/pages/messages";
import Billing from "@/pages/billing";
import Reports from "@/pages/reports";
import Practice from "@/pages/practice";
import SignaturePage from "@/pages/sign";
import { AuthProvider } from "@/hooks/use-auth";
import { CRMProvider } from "@/hooks/use-crm";
// CRM pages
import CRMIndex from "@/pages/crm";
import CRMDashboard from "@/pages/crm/dashboard";
import CRMCampaigns from "@/pages/crm/campaigns";
import CRMClientAcquisition from "@/pages/crm/client-acquisition";
import CRMMarketing from "@/pages/crm/marketing";
import CRMAnalytics from "@/pages/crm/analytics";
import CRMEvents from "@/pages/crm/events";
import CRMReferralSources from "@/pages/crm/referral-sources";
import CRMContactHistory from "@/pages/crm/contact-history";
// Old mock auth provider - we're not using this anymore
// import { AuthProvider as MockAuthProvider } from "@/hooks/use-auth";
import { ProgressNoteForm } from "@/components/forms/ProgressNoteForm";
import { IntakeForm } from "@/components/forms/IntakeForm";

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

import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/password-reset" component={PasswordResetPage} />
      <Route path="/practice-registration" component={PracticeRegistrationPage} />
      <Route path="/sign/:accessUrl" component={SignaturePage} />
      <ProtectedRoute path="/settings/profile" component={ProfileSettingsPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/clients" component={Clients} />
      <ProtectedRoute path="/clients/:id" component={Clients} />
      
      {/* Documentation routes */}
      <ProtectedRoute path="/documentation" component={DocumentationRoute} />
      <ProtectedRoute path="/documentation/:type" component={DocumentationRoute} />
      <ProtectedRoute path="/templates" component={Templates} />
      
      <ProtectedRoute path="/scheduling" component={Scheduling} />
      <ProtectedRoute path="/messages" component={Messages} />
      
      {/* CRM routes - wrapped with CRMProvider */}
      <WrappedCRMRoute path="/crm" component={CRMIndex} />
      <WrappedCRMRoute path="/crm/dashboard" component={CRMDashboard} />
      <WrappedCRMRoute path="/crm/campaigns" component={CRMCampaigns} />
      <WrappedCRMRoute path="/crm/client-acquisition" component={CRMClientAcquisition} />
      <WrappedCRMRoute path="/crm/marketing" component={CRMMarketing} />
      <WrappedCRMRoute path="/crm/analytics" component={CRMAnalytics} />
      <WrappedCRMRoute path="/crm/events" component={CRMEvents} />
      <WrappedCRMRoute path="/crm/referral-sources" component={CRMReferralSources} />
      <WrappedCRMRoute path="/crm/contact-history" component={CRMContactHistory} />
      
      <ProtectedRoute path="/billing" component={Billing} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/practice" component={Practice} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Component to wrap CRM related routes
const CRMRoute = ({ Component }: { Component: React.ComponentType }) => {
  return (
    <CRMProvider>
      <Component />
    </CRMProvider>
  );
};

// Wrap CRM routes with the CRM provider
function WrappedCRMRoute({ component: Component, path }: { component: React.ComponentType, path: string }) {
  return <ProtectedRoute path={path} component={() => <CRMRoute Component={Component} />} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
