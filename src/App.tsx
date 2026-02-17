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
const MemberAuthGuard = lazy(() => import("./components/member/MemberAuthGuard"));
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
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminAuthGuard><Dashboard /></AdminAuthGuard>} />
              <Route path="/admin" element={<AdminAuthGuard><AdminPanel /></AdminAuthGuard>} />
              
              {/* Member Routes - Require Login */}
              <Route path="/member/welcome" element={<MemberAuthGuard><MemberWelcome /></MemberAuthGuard>} />
              <Route path="/member" element={<MemberAuthGuard><MemberPortal /></MemberAuthGuard>} />
              <Route path="/member/history" element={<MemberAuthGuard><MemberHistory /></MemberAuthGuard>} />
              <Route path="/member/events" element={<MemberAuthGuard><MemberEvents /></MemberAuthGuard>} />
              <Route path="/member/profile/edit" element={<MemberAuthGuard><MemberProfileEdit /></MemberAuthGuard>} />
              <Route path="/member/rewards" element={<MemberAuthGuard><MemberRewards /></MemberAuthGuard>} />
              <Route path="/member/experiences" element={<MemberAuthGuard><MemberExperiences /></MemberAuthGuard>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
