import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Gate from "./pages/Gate";
import RequestInvitation from "./pages/RequestInvitation";
import VerificationPending from "./pages/VerificationPending";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminResetPassword from "./pages/AdminResetPassword";
import AdminSetupPassword from "./pages/AdminSetupPassword";
import MemberWelcome from "./pages/MemberWelcome";
import MemberPortal from "./pages/MemberPortal";
import MemberHistory from "./pages/MemberHistory";
import MemberEvents from "./pages/MemberEvents";
import MemberProfileEdit from "./pages/MemberProfileEdit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Entry Experience */}
            <Route path="/" element={<Gate />} />
            <Route path="/request-invitation" element={<RequestInvitation />} />
            <Route path="/verification-pending" element={<VerificationPending />} />
            <Route path="/welcome" element={<Index />} />
            
            {/* Admin Routes */}
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route path="/admin/setup-password" element={<AdminSetupPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Member Routes - Open Access */}
            <Route path="/member/welcome" element={<MemberWelcome />} />
            <Route path="/member" element={<MemberPortal />} />
            <Route path="/member/history" element={<MemberHistory />} />
            <Route path="/member/events" element={<MemberEvents />} />
            <Route path="/member/profile/edit" element={<MemberProfileEdit />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
