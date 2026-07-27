import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import SACBMLogin from "./pages/SACBMLogin";
import SACBMResetPassword from "./pages/SACBMResetPassword";
import SACBMPortal from "./pages/SACBMPortal";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/sacbm-login" replace />} />
            <Route path="/sacbm-login" element={<SACBMLogin />} />
            <Route path="/sacbm-reset-password" element={<SACBMResetPassword />} />
            <Route path="/sacbm-portal" element={<SACBMPortal />} />
            <Route path="*" element={<Navigate to="/sacbm-login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
