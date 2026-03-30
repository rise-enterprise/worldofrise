import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { GoldenBeatsScene } from "@/components/crystal/GoldenBeatsScene";
import UnifiedLoginForm from "@/components/auth/UnifiedLoginForm";
import { motion, AnimatePresence } from "framer-motion";

const Gate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (searchParams.get("login") === "true") setShowLogin(true);
  }, [searchParams]);

  return (
    <div className="fixed inset-0 bg-background">
      <GoldenBeatsScene
        onEnter={() => setShowLogin(true)}
        onRequestMembership={() => navigate("/request-invitation")}
      />

      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(10,9,8,0.92)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <UnifiedLoginForm onBack={() => setShowLogin(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gate;
