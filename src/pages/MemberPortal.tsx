import { useMembers } from '@/hooks/useMembers';
import { MemberCard } from '@/components/member/MemberCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function MemberPortal() {
  const { data: guests = [], isLoading } = useMembers();
  const member = guests[0]; // Demo member - first guest
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-noir-black p-4">
        <div className="max-w-md mx-auto space-y-4 pt-8">
          <Skeleton className="h-64 w-full bg-noir-surface" />
          <Skeleton className="h-32 w-full bg-noir-surface" />
          <Skeleton className="h-32 w-full bg-noir-surface" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-noir-black flex items-center justify-center p-4">
        <Card variant="obsidian" className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground tracking-wide">No member data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-black relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[300px] bg-burgundy/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10">
        <MemberCard guest={member} />
      </div>
    </div>
  );
}
