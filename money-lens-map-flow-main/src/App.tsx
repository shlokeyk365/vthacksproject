import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FinancialBodyguardProvider } from "./contexts/FinancialBodyguardContext";
import { MapboxProvider } from "./contexts/MapboxContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { LoginForm } from "./components/auth/LoginForm";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import SpendingCaps from "./pages/SpendingCaps";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import { FinancialBodyguardPage } from "./pages/FinancialBodyguard";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import toast, { Toaster as HotToast } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const AppRoutes = () => {
    const { isAuthenticated, isLoading, user } = useAuth();

    console.log('AppRoutes render:', { isAuthenticated, isLoading, user });

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <LoginForm />;
    }

    return (
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="map" element={<MapView />} />
            <Route path="caps" element={<SpendingCaps />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="bodyguard" element={<FinancialBodyguardPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    );
  };

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <MapboxProvider>
          <FinancialBodyguardProvider>
            <NotificationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <HotToast 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'hsl(var(--card))',
                      color: 'hsl(var(--card-foreground))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1rem',
                      margin: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    },
                  }}
                />
                <AppRoutes />
              </TooltipProvider>
            </NotificationProvider>
          </FinancialBodyguardProvider>
        </MapboxProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
