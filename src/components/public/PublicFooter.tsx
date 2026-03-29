import { useNavigate } from "react-router-dom";

const footerLinks = {
  Experience: [
    { label: "About RISE", path: "/about" },
    { label: "Locations", path: "/locations" },
    { label: "Membership", path: "/request-invitation" },
  ],
  Support: [
    { label: "FAQ", path: "/faq" },
    { label: "Contact", path: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", path: "#" },
    { label: "Terms of Service", path: "#" },
  ],
};

export default function PublicFooter() {
  const navigate = useNavigate();

  return (
    <footer className="relative border-t border-border/10">
      {/* Gradient top line */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-display tracking-[0.2em] uppercase text-foreground mb-4">
              RISE
            </h3>
            <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-xs">
              A private world of privileges. Global hospitality intelligence for the discerning few.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/40 mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-sm text-muted-foreground/60 hover:text-primary transition-colors duration-300"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/30">
            © {new Date().getFullYear()} RISE Holding. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/30">
              Doha · Riyadh · London
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
