import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VIPEmblem } from "@/components/ui/vip-emblem";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-noir-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Ambient Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-burgundy/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <Card variant="obsidian" className="animate-fade-in">
          <CardContent className="p-12">
            <div className="flex justify-center mb-6">
              <VIPEmblem size="lg" tier="elite" />
            </div>
            
            <h1 className="font-display text-6xl text-gold mb-4">404</h1>
            
            <p className="text-xl text-foreground font-display tracking-wide mb-2">
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
    </div>
  );
};

export default NotFound;
