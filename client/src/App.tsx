import { Switch, Route } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/clients" component={Clients} />
      <Route path="/documentation" component={Documentation} />
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
