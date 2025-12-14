import { mockGuests } from '@/data/mockData';
import { MemberCard } from '@/components/member/MemberCard';

export default function MemberPortal() {
  // For demo, show the first VIP member
  const member = mockGuests[0];

  return <MemberCard guest={member} />;
}
