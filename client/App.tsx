import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import PublicGallery from "./pages/PublicGallery";
import About from "./pages/About";
import OurMembers from "./pages/OurMembers";
import MemberSection from "./pages/MemberSection";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import SACBMLogin from "./pages/SACBMLogin";
import SACBMPortal from "./pages/SACBMPortal";

// Member/Admin pages
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import Upload from "./pages/Upload";
import Weather from "./pages/Weather";
import INGDDashboard from "./pages/INGDDashboard";
import GovernmentPriorities from "./pages/GovernmentPriorities";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import DataRepository from "./pages/DataRepository";
import Achievements from "./pages/Achievements";

import ProtectedRoute from "./components/ProtectedRoute";
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
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/impact" element={<Home />} />
            <Route path="/gallery" element={<PublicGallery />} />
            <Route path="/our-members" element={<OurMembers />} />
            <Route path="/about" element={<About />} />
            <Route path="/members" element={<MemberSection />} />

            {/* AUTHENTICATION */}
            <Route path="/login" element={<Login />} />
            <Route path="/sacbm-login" element={<SACBMLogin />} />

            {/* MEMBER/ADMIN ROUTES */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <Requests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/actions"
              element={
                <ProtectedRoute>
                  <Achievements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/weather"
              element={
                <ProtectedRoute>
                  <Weather />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ingd-dashboard"
              element={
                <ProtectedRoute>
                  <INGDDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/government-priorities"
              element={
                <ProtectedRoute>
                  <GovernmentPriorities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-repository"
              element={
                <ProtectedRoute>
                  <DataRepository />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />

            {/* SACBM PORTAL */}
            <Route path="/sacbm-portal" element={<SACBMPortal />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
