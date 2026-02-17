import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Critical: Load Gate immediately as it's the landing page
import Gate from "./pages/Gate";

// Lazy load all other routes to reduce initial bundle size
const RequestInvitation = lazy(() => import("./pages/RequestInvitation"));
const VerificationPending = lazy(() => import("./pages/VerificationPending"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MemberWelcome = lazy(() => import("./pages/MemberWelcome"));
const MemberPortal = lazy(() => import("./pages/MemberPortal"));
const MemberHistory = lazy(() => import("./pages/MemberHistory"));
const MemberEvents = lazy(() => import("./pages/MemberEvents"));
const MemberProfileEdit = lazy(() => import("./pages/MemberProfileEdit"));
const MemberRewards = lazy(() => import("./pages/MemberRewards"));
const MemberExperiences = lazy(() => import("./pages/MemberExperiences"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminAuthGuard = lazy(() => import("./components/admin/AdminAuthGuard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              {/* Entry Experience */}
              <Route path="/" element={<Gate />} />
              <Route path="/request-invitation" element={<RequestInvitation />} />
              <Route path="/verification-pending" element={<VerificationPending />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminAuthGuard><AdminPanel /></AdminAuthGuard>} />
              
              {/* Member Routes - Open Access */}
              <Route path="/member/welcome" element={<MemberWelcome />} />
              <Route path="/member" element={<MemberPortal />} />
              <Route path="/member/history" element={<MemberHistory />} />
              <Route path="/member/events" element={<MemberEvents />} />
              <Route path="/member/profile/edit" element={<MemberProfileEdit />} />
              <Route path="/member/rewards" element={<MemberRewards />} />
              <Route path="/member/experiences" element={<MemberExperiences />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
