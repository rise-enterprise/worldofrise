import { Navigate, useLocation } from 'react-router-dom';
import { useMemberAuthContext } from '@/contexts/MemberAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedMemberRouteProps {
  children: React.ReactNode;
}

export default function ProtectedMemberRoute({ children }: ProtectedMemberRouteProps) {
  const { isMember, isLoading } = useMemberAuthContext();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isMember) {
    return <Navigate to="/member/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
