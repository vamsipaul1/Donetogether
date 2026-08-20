import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Statically import the main Index/Landing page so it loads in a split-second instantly on first visit
import Index from "./pages/Index";

// Export dynamic dynamic-import functions so they can be preloaded on demand (e.g. on button/link hover)
export const lazyRoutes = {
  SignUp: () => import("./pages/SignUp"),
  Login: () => import("./pages/Login"),
  Dashboard: () => import("./pages/Dashboard"),
  CreateProject: () => import("./pages/CreateProject"),
  InvitePage: () => import("./pages/InvitePage"),
  JoinProject: () => import("./pages/JoinProject"),
  Onboarding: () => import("./pages/Onboarding"),
  SetupProfile: () => import("./pages/SetupProfile"),
  Premium: () => import("./pages/Premium"),
  NotFound: () => import("./pages/NotFound"),
  VerifyEmail: () => import("./pages/VerifyEmail"),
  WhyChoose: () => import("./pages/WhyChoose"),
  MessagesPage: () => import("./pages/MessagesPage"),
};

// Define Lazy-Loaded Page Components using dynamic imports
const SignUp = lazy(lazyRoutes.SignUp);
const Login = lazy(lazyRoutes.Login);
const Dashboard = lazy(lazyRoutes.Dashboard);
const CreateProject = lazy(lazyRoutes.CreateProject);
const InvitePage = lazy(lazyRoutes.InvitePage);
const JoinProject = lazy(lazyRoutes.JoinProject);
const Onboarding = lazy(lazyRoutes.Onboarding);
const SetupProfile = lazy(lazyRoutes.SetupProfile);
const Premium = lazy(lazyRoutes.Premium);
const NotFound = lazy(lazyRoutes.NotFound);
const VerifyEmail = lazy(lazyRoutes.VerifyEmail);
const WhyChoose = lazy(lazyRoutes.WhyChoose);
const MessagesPage = lazy(lazyRoutes.MessagesPage);

import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";
import { useLocation } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/why-choose" element={<PageTransition><WhyChoose /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
        <Route path="/premium" element={<PageTransition><Premium /></PageTransition>} />
        <Route path="/onboarding" element={<ProtectedRoute><PageTransition><Onboarding /></PageTransition></ProtectedRoute>} />
        <Route path="/setup-profile" element={<ProtectedRoute><PageTransition><SetupProfile /></PageTransition></ProtectedRoute>} />

        <Route path="/project-room" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/create-project" element={<ProtectedRoute><PageTransition><CreateProject /></PageTransition></ProtectedRoute>} />
        <Route path="/invite/:projectId" element={<ProtectedRoute><PageTransition><InvitePage /></PageTransition></ProtectedRoute>} />
        <Route path="/join" element={<ProtectedRoute><PageTransition><JoinProject /></PageTransition></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><PageTransition><MessagesPage /></PageTransition></ProtectedRoute>} />
        <Route path="/messages/:projectId" element={<ProtectedRoute><PageTransition><MessagesPage /></PageTransition></ProtectedRoute>} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  console.log("🧩 App component rendering...");
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
              <AnimatedRoutes />
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
