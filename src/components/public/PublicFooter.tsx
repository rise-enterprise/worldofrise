import { useNavigate } from "react-router-dom";

const footerLinks = {
  World: [
    { label: "About", path: "/about" },
    { label: "Locations", path: "/locations" },
    { label: "Membership", path: "/request-invitation" },
  ],
  Information: [
    { label: "FAQ", path: "/faq" },
    { label: "Contact", path: "/contact" },
    { label: "Privacy", path: "#" },
  ],
};

export default function PublicFooter() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border/50">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <h3 className="text-sm font-display tracking-[0.35em] uppercase text-foreground mb-4">
              RISE
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              A private world of refined experiences. Curated hospitality for the discerning few.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} RISE Holding
          </p>
          <p className="text-xs text-muted-foreground">
            Doha &middot; Riyadh &middot; Abu Dhabi &middot; London
          </p>
        </div>
      </div>
    </footer>
  );
}