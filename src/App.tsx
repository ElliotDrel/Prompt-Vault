import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PromptsProvider } from "@/contexts/PromptsContext";
import { Toaster as HotToaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Fix for blue text selection overlay issue
  useEffect(() => {
    const clearSelection = () => {
      if (window.getSelection) {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
          // Delay clearing to allow for copy operations
          setTimeout(() => {
            selection.removeAllRanges();
          }, 100);
        }
      }
    };

    // Clear selection on clicks outside of text areas
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('textarea') && !target.closest('input')) {
        clearSelection();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PromptsProvider>
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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PromptsProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
