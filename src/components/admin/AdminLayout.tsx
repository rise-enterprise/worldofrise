import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminMobileNav } from './AdminMobileNav';

export function AdminLayout() {
  const { isAuthenticated, isLoading, admin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !admin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      {!isMobile && <AdminSidebar />}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        
        <main className={`flex-1 p-4 md:p-6 overflow-auto ${isMobile ? 'pb-20' : ''}`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <AdminMobileNav />}
    </div>
  );
}
