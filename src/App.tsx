import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { MemberAuthProvider } from "@/contexts/MemberAuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminResetPassword from "./pages/AdminResetPassword";
import AdminSetupPassword from "./pages/AdminSetupPassword";
import MemberLogin from "./pages/MemberLogin";
import MemberPortal from "./pages/MemberPortal";
import MemberHistory from "./pages/MemberHistory";
import MemberEvents from "./pages/MemberEvents";
import MemberProfileEdit from "./pages/MemberProfileEdit";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedMemberRoute from "./components/ProtectedMemberRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AdminAuthProvider>
              <MemberAuthProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/reset-password" element={<AdminResetPassword />} />
                  <Route path="/admin/setup-password" element={<AdminSetupPassword />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/member/login" element={<MemberLogin />} />
                  <Route path="/member" element={
                    <ProtectedMemberRoute>
                      <MemberPortal />
                    </ProtectedMemberRoute>
                  } />
                  <Route path="/member/history" element={
                    <ProtectedMemberRoute>
                      <MemberHistory />
                    </ProtectedMemberRoute>
                  } />
                  <Route path="/member/events" element={
                    <ProtectedMemberRoute>
                      <MemberEvents />
                    </ProtectedMemberRoute>
                  } />
                  <Route path="/member/profile/edit" element={
                    <ProtectedMemberRoute>
                      <MemberProfileEdit />
                    </ProtectedMemberRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MemberAuthProvider>
            </AdminAuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
