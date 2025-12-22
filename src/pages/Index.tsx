import { PublicNavigation } from '@/components/landing/PublicNavigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TiersPreviewSection } from '@/components/landing/TiersPreviewSection';
import { BrandsSection } from '@/components/landing/BrandsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { useMemberAuth } from '@/contexts/MemberAuthContext';
import { MemberDashboard } from '@/components/member/MemberDashboard';

const Index = () => {
  const { user, member, isLoading } = useMemberAuth();

  // Show member dashboard if logged in
  if (!isLoading && user && member) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavigation />
        <main className="pt-16">
          <MemberDashboard />
        </main>
        <Footer />
      </div>
    );
  }

  // Show public landing page
  return (
    <div className="min-h-screen bg-background">
      <PublicNavigation />
      <main className="pt-16">
        <HeroSection />
        <HowItWorksSection />
        <TiersPreviewSection />
        <BrandsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;