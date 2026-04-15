import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Providers } from "./components/Providers";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import Index from "./pages/Index";
import CreateMarket from "./pages/CreateMarket";
import MarketDetail from "./pages/MarketDetail";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useLiveSimulation } from "./hooks/useLiveSimulation";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground text-sm">Loading...</div>;
  if (!user) return <Navigate to="/" replace />; // Redirect to home (which will show connect) if not authed
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 page-transition">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<ProtectedRoute><CreateMarket /></ProtectedRoute>} />
            <Route path="/market/:id" element={<ProtectedRoute><MarketDetail /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

const App = () => {
  useLiveSimulation();
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Providers>
          <TooltipProvider>
            <Sonner />
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </TooltipProvider>
        </Providers>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

