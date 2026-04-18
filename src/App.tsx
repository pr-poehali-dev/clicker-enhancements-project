
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Menu from "./pages/Menu";

const queryClient = new QueryClient();

const App = () => {
  const [screen, setScreen] = useState<"menu" | "game">("menu");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {screen === "menu" ? (
          <Menu onPlay={() => setScreen("game")} />
        ) : (
          <Index onMenu={() => setScreen("menu")} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;