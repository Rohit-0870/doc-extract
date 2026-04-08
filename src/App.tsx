import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, MemoryRouter } from "react-router-dom";
import NotFound from "./pages/NotFound";
import AzureAnalyzePage from "./pages/AzureAnalyzePage";
import DocumentsPage from "./pages/DocumentsPage";
import AdminConfig from "./pages/AdminConfig";
import { ThemeProvider } from "@/components/ThemeContext";
import { useMemo } from "react";

type AppProps = {
  config?: {
    labels?: {
      title?: string;
    };
  };
};

const App = ({ config }: AppProps) => {
  const isEmbedded = (window as any).__DOCINTEL_EMBED__ === true;
  const Router = isEmbedded ? MemoryRouter : BrowserRouter;

  const queryClient = useMemo(() => new QueryClient(), []);

  // ✅ API comes ONLY from env
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = import.meta.env.VITE_TOKEN;

  console.log("Using ENV API:", apiUrl);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <Router>
            <Routes>
              <Route
                path="/"
                element={<DocumentsPage apiUrl={apiUrl} token={token} />}
              />

              <Route
                path="/analyze-azure"
                element={
                  <AzureAnalyzePage apiUrl={apiUrl} token={token} />
                }
              />

              <Route path="/admin" element={<AdminConfig />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;