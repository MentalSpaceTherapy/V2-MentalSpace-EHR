import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Clients } from "./pages/Clients";
import { ClientDetails } from "./pages/ClientDetails";
import { Appointments } from "./pages/Appointments";
import { Documents } from "./pages/Documents";
import { Templates } from "./pages/Templates";
import { Settings } from "./pages/Settings";
import { Telehealth } from "./pages/Telehealth";
import { NotFound } from "./pages/NotFound";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useTelehealth } from "./hooks/useTelehealth";
import { useWebSocket } from "./hooks/useWebSocket";
import { useNotifications } from "./hooks/useNotifications";
import { useTheme } from "./hooks/useTheme";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { theme } = useTheme();
  const { initialize: initializeTelehealth } = useTelehealth();
  const { initialize: initializeWebSocket } = useWebSocket();
  const { initialize: initializeNotifications } = useNotifications();

  // Initialize services
  React.useEffect(() => {
    initializeTelehealth();
    initializeWebSocket();
    initializeNotifications();
  }, [initializeTelehealth, initializeWebSocket, initializeNotifications]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Router>
              <div className={`app ${theme}`}>
                <Toaster position="top-right" />
                <Routes>
                  {/* Dashboard as default landing page */}
                  <Route
                    path="/"
                    element={
                      <Layout>
                        <Dashboard />
                      </Layout>
                    }
                  />
                  <Route
                    path="/clients"
                    element={
                      <Layout>
                        <Clients />
                      </Layout>
                    }
                  />
                  <Route
                    path="/clients/:id"
                    element={
                      <Layout>
                        <ClientDetails />
                      </Layout>
                    }
                  />
                  <Route
                    path="/appointments"
                    element={
                      <Layout>
                        <Appointments />
                      </Layout>
                    }
                  />
                  <Route
                    path="/documents"
                    element={
                      <Layout>
                        <Documents />
                      </Layout>
                    }
                  />
                  <Route
                    path="/templates"
                    element={
                      <Layout>
                        <Templates />
                      </Layout>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <Layout>
                        <Settings />
                      </Layout>
                    }
                  />
                  <Route
                    path="/telehealth"
                    element={
                      <Layout>
                        <Telehealth />
                      </Layout>
                    }
                  />
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App; 