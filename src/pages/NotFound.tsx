import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { CrystalPageWrapper } from "@/components/effects/CrystalPageWrapper";
import { CrystalEmblem } from "@/components/effects/CrystalEmblem";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <CrystalPageWrapper variant="tiffany" sparkleCount={20}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card variant="obsidian" className="animate-fade-in crystal-panel-gold max-w-md">
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <CrystalEmblem size="md" />
            </div>
            
            <h1 className="font-display text-6xl text-primary mb-4">404</h1>
            
            <p className="text-xl text-foreground font-display tracking-crystal mb-2">
              Access Restricted
            </p>
            <p className="text-muted-foreground mb-8">
              This passage does not exist within our realm
            </p>
            
            <Button 
              variant="vip-gold" 
              onClick={() => navigate('/')}
              className="tracking-widest uppercase"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Entrance
            </Button>
          </CardContent>
        </Card>
      </div>
    </CrystalPageWrapper>
  );
};

export default NotFound;
