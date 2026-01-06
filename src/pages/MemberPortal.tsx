import { useMember } from '@/hooks/useMembers';
import { useMemberAuthContext } from '@/contexts/MemberAuthContext';
import { MemberCard } from '@/components/member/MemberCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { CrystalBackground } from '@/components/effects/CrystalBackground';

export default function MemberPortal() {
  const { member: memberAuth } = useMemberAuthContext();
  const { data: member, isLoading } = useMember(memberAuth?.memberId || undefined);
  
  if (isLoading) {
    return (
      <CrystalBackground variant="subtle" className="min-h-screen p-4">
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </CrystalBackground>
    );
  }

  if (!member) {
    return (
      <CrystalBackground variant="subtle" className="min-h-screen flex items-center justify-center">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No member data available</p>
          </CardContent>
        </Card>
      </CrystalBackground>
    );
  }

  return <MemberCard guest={member} />;
}