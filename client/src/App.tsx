import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Documentation from "@/pages/documentation";
import Scheduling from "@/pages/scheduling";
import Messages from "@/pages/messages";
import Billing from "@/pages/billing";
import Reports from "@/pages/reports";
import Practice from "@/pages/practice";
import { AuthProvider } from "@/hooks/useAuth";
import { ProgressNoteForm } from "@/components/forms/ProgressNoteForm";
import { IntakeForm } from "@/components/forms/IntakeForm";

// Component to handle the documentation routes and pass the formType
const DocumentationRoute = () => {
  const [location] = useLocation();
  let formType = null;
  
  // Extract form type from URL
  if (location.includes("/intake")) {
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/clients" component={Clients} />
      
      {/* Documentation routes */}
      <Route path="/documentation" component={DocumentationRoute} />
      <Route path="/documentation/:type" component={DocumentationRoute} />
      
      <Route path="/scheduling" component={Scheduling} />
      <Route path="/messages" component={Messages} />
      <Route path="/billing" component={Billing} />
      <Route path="/reports" component={Reports} />
      <Route path="/practice" component={Practice} />
      <Route component={NotFound} />
    </Switch>
  );
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
