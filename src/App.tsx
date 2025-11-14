import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { initializeFarcasterSDK } from "@/lib/farcaster";

const queryClient = new QueryClient();

// Detect if running as a Farcaster miniapp and initialize SDK
function initializeMiniappSDK() {
  const url = new URL(window.location.href);
  const isMiniApp =
    url.pathname.startsWith("/mini") ||
    url.searchParams.get("miniApp") === "true";

  if (isMiniApp) {
    // Use the centralized initializer (it's idempotent so calling multiple
    // times is safe). This avoids importing/initializing the SDK twice
    // and prevents repeated ready()/quick-auth loops.
    initializeFarcasterSDK().catch(err => {
      console.warn("Failed to initialize Farcaster miniapp SDK:", err);
    });
  }
}

const App = () => {
  useEffect(() => {
    initializeMiniappSDK();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
