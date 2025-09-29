import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PromptsProvider } from "@/contexts/PromptsContext";
import { CopyHistoryProvider } from "@/contexts/CopyHistoryContext";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Toaster as HotToaster } from 'react-hot-toast';
import Index from "./pages/Index";
import CopyHistory from "./pages/CopyHistory";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <PromptsProvider>
            <CopyHistoryProvider>
              <Toaster />
              <Sonner />
              <HotToaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    borderRadius: '12px',
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                }}
              />
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<Auth />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <Index />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <RequireAuth>
                      <CopyHistory />
                    </RequireAuth>
                  }
                />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CopyHistoryProvider>
          </PromptsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
