import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider, ScrollRestoration } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PromptsProvider } from "@/contexts/PromptsContext";
import { CopyHistoryProvider } from "@/contexts/CopyHistoryContext";
import { StorageAdapterProvider } from "@/contexts/StorageAdapterContext";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Toaster as HotToaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/react";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import CopyHistory from "./pages/CopyHistory";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import PromptDetail from "./pages/PromptDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch when user tabs back
      retry: 1, // Single retry on network failures
      staleTime: 30000, // Cache data for 30 seconds
    },
  },
});

const RootLayout = () => (
  <>
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
    <Outlet />
    <ScrollRestoration />
    <Analytics />
    <ScrollToTop />
  </>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Index />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/prompt/new"
        element={
          <RequireAuth>
            <PromptDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/prompt/:promptId"
        element={
          <RequireAuth>
            <PromptDetail />
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
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StorageAdapterProvider>
          <PromptsProvider>
            <CopyHistoryProvider>
              <RouterProvider router={router} />
            </CopyHistoryProvider>
          </PromptsProvider>
        </StorageAdapterProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
