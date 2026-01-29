import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/CreateProject";
import InvitePage from "./pages/InvitePage";
import JoinProject from "./pages/JoinProject";
import Onboarding from "./pages/Onboarding";
import Premium from "./pages/Premium";
import NotFound from "./pages/NotFound";

import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/premium" element={<PageTransition><Premium /></PageTransition>} />
        <Route path="/onboarding" element={<ProtectedRoute><PageTransition><Onboarding /></PageTransition></ProtectedRoute>} />

        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/create-project" element={<ProtectedRoute><PageTransition><CreateProject /></PageTransition></ProtectedRoute>} />
        <Route path="/invite/:projectId" element={<ProtectedRoute><PageTransition><InvitePage /></PageTransition></ProtectedRoute>} />
        <Route path="/join" element={<ProtectedRoute><PageTransition><JoinProject /></PageTransition></ProtectedRoute>} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
