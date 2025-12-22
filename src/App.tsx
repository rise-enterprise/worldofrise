import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Rewards from "./pages/Rewards";
import MemberLogin from "./pages/MemberLogin";
import MemberJoin from "./pages/MemberJoin";
import MemberPortal from "./pages/MemberPortal";
import MemberHistory from "./pages/MemberHistory";
import MemberEvents from "./pages/MemberEvents";
import NotFound from "./pages/NotFound";
import { MemberAuthProvider } from "./contexts/MemberAuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import AdminLogin from "./pages/admin/AdminLogin";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MemberAuthProvider>
            <Routes>
              {/* Public & Member Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/login" element={<MemberLogin />} />
              <Route path="/join" element={<MemberJoin />} />
              <Route path="/member" element={<MemberPortal />} />
              <Route path="/member/history" element={<MemberHistory />} />
              <Route path="/member/events" element={<MemberEvents />} />
              
              {/* Hidden Admin Routes - No public links */}
              <Route path="/admin/login" element={
                <AdminAuthProvider>
                  <AdminLogin />
                </AdminAuthProvider>
              } />
              <Route path="/admin" element={
                <AdminAuthProvider>
                  <AdminLayout />
                </AdminAuthProvider>
              }>
                <Route index element={<AdminOverview />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MemberAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;