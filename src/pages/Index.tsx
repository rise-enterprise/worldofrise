import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';
import { MemberCard } from '@/components/member/MemberCard';
import { mockGuests } from '@/data/mockData';

const Index = () => {
  const navigate = useNavigate();
  // Use the first mock guest as the logged-in member
  const currentMember = mockGuests[0];

  return (
    <div className="relative min-h-screen">
      {/* Admin Dashboard Button - Top Right */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/dashboard')}
        className="fixed top-4 right-4 z-50 text-muted-foreground hover:text-foreground bg-background/80 backdrop-blur-sm"
      >
        <LayoutDashboard className="h-4 w-4 mr-2" />
        Admin
      </Button>

      {/* Member Experience */}
      <MemberCard guest={currentMember} isHomePage />
    </div>
  );
};

export default Index;
