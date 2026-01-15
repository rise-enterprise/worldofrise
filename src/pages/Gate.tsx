import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CrystalBackground } from "@/components/effects/CrystalBackground";
import { CrystalEmblem } from "@/components/effects/CrystalEmblem";
import { DiamondSparkles } from "@/components/effects/DiamondSparkles";

const Gate = () => {
  const navigate = useNavigate();

  return (
    <CrystalBackground variant="tiffany" className="min-h-screen flex flex-col">
      {/* Diamond sparkles overlay */}
      <DiamondSparkles count={35} />

      {/* Header - Private Society */}
      <motion.header
        className="pt-12 pb-6 text-center relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span
          className="text-xs tracking-[0.4em] uppercase font-body"
          style={{
            color: "hsl(var(--gold) / 0.7)",
          }}
        >
          ─── Private Society ───
        </span>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Crystal Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <CrystalEmblem className="mb-8" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Where Access Is Earned
        </motion.p>

        {/* Unified Brand Portal */}
        <motion.button
          className="w-full max-w-md group relative overflow-hidden"
          onClick={() => navigate("/member")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Card background */}
          <div
            className="relative p-10 transition-all duration-500"
            style={{
              background: "linear-gradient(135deg, hsl(var(--noir-obsidian)) 0%, hsl(220 25% 9%) 100%)",
              border: "1px solid hsl(var(--gold) / 0.25)",
              boxShadow: `
                0 0 60px hsl(var(--gold) / 0.08),
                inset 0 1px 0 hsl(var(--gold) / 0.15)
              `,
            }}
          >
            {/* Crystal facet overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `
                  linear-gradient(135deg, transparent 40%, hsl(var(--gold) / 0.15) 50%, transparent 60%),
                  linear-gradient(225deg, transparent 40%, hsl(var(--gold) / 0.1) 50%, transparent 60%)
                `,
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Brand diamonds */}
              <div className="flex items-center justify-center gap-8 mb-6">
                {/* NOIR diamond */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rotate-45 mb-2 transition-all duration-500 group-hover:scale-110"
                    style={{
                      background: "linear-gradient(135deg, hsl(210 20% 60%) 0%, hsl(210 30% 80%) 100%)",
                      boxShadow: "0 0 12px hsl(210 30% 70% / 0.5)",
                    }}
                  />
                  <span className="text-lg font-display tracking-[0.4em]" style={{ color: "hsl(var(--foreground))" }}>
                    NOIR
                  </span>
                  <span
                    className="text-[10px] tracking-[0.15em] uppercase mt-1"
                    style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}
                  >
                    Café & Ultra experience
                  </span>
                </div>

                {/* Divider */}
                <div
                  className="h-12 w-[1px]"
                  style={{ background: "linear-gradient(180deg, transparent, hsl(var(--gold) / 0.4), transparent)" }}
                />

                {/* SASSO diamond */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rotate-45 mb-2 transition-all duration-500 group-hover:scale-110"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--gold-muted)) 0%, hsl(var(--gold)) 100%)",
                      boxShadow: "0 0 12px hsl(var(--gold) / 0.5)",
                    }}
                  />
                  <span className="text-lg font-display tracking-[0.4em]" style={{ color: "hsl(var(--foreground))" }}>
                    SASSO
                  </span>
                  <span
                    className="text-[10px] tracking-[0.15em] uppercase mt-1"
                    style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}
                  >
                    Fine Dining Italian
                  </span>
                </div>
              </div>

              {/* Horizontal divider */}
              <div
                className="w-24 h-[1px] mx-auto mb-4 transition-all duration-500 group-hover:w-32"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.5), transparent)",
                }}
              />

              {/* Tagline */}
              <p className="text-xs tracking-wide text-center" style={{ color: "hsl(var(--gold) / 0.7)" }}>
                Enter the Private Salon
              </p>

              {/* Enter arrow */}
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 text-center">
                <span className="text-xs tracking-widest uppercase" style={{ color: "hsl(var(--gold) / 0.6)" }}>
                  Enter →
                </span>
              </div>
            </div>

            {/* Hover light sweep */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, transparent 0%, hsl(var(--gold) / 0.05) 50%, transparent 100%)",
              }}
              initial={false}
              transition={{ duration: 0.5 }}
            />

            {/* Corner accents */}
            <div
              className="absolute top-0 left-0 w-10 h-[1px] transition-all duration-500 group-hover:w-14"
              style={{ background: "hsl(var(--gold) / 0.4)" }}
            />
            <div
              className="absolute top-0 left-0 w-[1px] h-10 transition-all duration-500 group-hover:h-14"
              style={{ background: "hsl(var(--gold) / 0.4)" }}
            />
            <div
              className="absolute bottom-0 right-0 w-10 h-[1px] transition-all duration-500 group-hover:w-14"
              style={{ background: "hsl(var(--gold) / 0.4)" }}
            />
            <div
              className="absolute bottom-0 right-0 w-[1px] h-10 transition-all duration-500 group-hover:h-14"
              style={{ background: "hsl(var(--gold) / 0.4)" }}
            />
          </div>
        </motion.button>

        {/* Request Invitation Button */}
        <motion.button
          className="mt-16 group relative overflow-hidden"
          onClick={() => navigate("/request-invitation")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="px-8 py-3 border transition-all duration-500"
            style={{
              borderColor: "hsl(var(--gold) / 0.4)",
              background: "hsl(var(--background) / 0.6)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span
              className="text-xs tracking-[0.3em] uppercase font-body"
              style={{
                color: "hsl(var(--gold))",
              }}
            >
              Request an Invitation
            </span>
          </div>
          {/* Hover light sweep */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: "linear-gradient(90deg, transparent 0%, hsl(var(--gold) / 0.1) 50%, transparent 100%)",
            }}
          />
        </motion.button>
      </main>

      {/* Footer */}
      <motion.footer
        className="py-8 text-center relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="text-xs tracking-widest uppercase transition-colors duration-300 hover:text-foreground"
          style={{
            color: "hsl(var(--muted-foreground) / 0.5)",
          }}
        >
          Administration
        </button>
      </motion.footer>
    </CrystalBackground>
  );
};

export default Gate;
