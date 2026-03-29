import { motion } from "framer-motion";
import PublicLayout from "@/components/public/PublicLayout";
import { MapPin, Clock, Phone } from "lucide-react";

const locations = [
  {
    city: "Doha",
    venues: [
      { name: "NOIR Café – Al Hazm", area: "Al Hazm Mall", brand: "noir" },
      { name: "NOIR Café – Old Doha Port", area: "Mina District", brand: "noir" },
      { name: "NOIR Café – West Walk", area: "West Walk", brand: "noir" },
      { name: "NOIR Café – Tennis Village", area: "Khalifa Tennis Complex", brand: "noir" },
      { name: "SASSO – Al Hazm", area: "Al Hazm Mall", brand: "sasso" },
      { name: "SASSO – West Walk", area: "West Walk", brand: "sasso" },
    ],
  },
  {
    city: "Riyadh",
    venues: [
      { name: "NOIR Café – Riyadh", area: "Kingdom Centre", brand: "noir" },
      { name: "SASSO – Riyadh", area: "Via Riyadh", brand: "sasso" },
    ],
  },
  {
    city: "Abu Dhabi",
    venues: [
      { name: "NOIR Café – Abu Dhabi", area: "The Galleria, Al Maryah Island", brand: "noir" },
    ],
  },
  {
    city: "London",
    venues: [
      { name: "NOIR Café – London", area: "Mayfair", brand: "noir" },
      { name: "SASSO – London", area: "Mayfair", brand: "sasso" },
    ],
  },
];

export default function Locations() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 40%, hsl(var(--gold) / 0.04) 0%, transparent 60%)",
        }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10 text-center max-w-3xl"
        >
          <span className="text-[10px] tracking-[0.4em] uppercase text-primary/40 font-body block mb-6">
            Destinations
          </span>
          <h1 className="text-4xl md:text-6xl font-display tracking-wide text-foreground mb-6">
            Our Locations
          </h1>
          <p className="text-muted-foreground/50 text-base max-w-lg mx-auto">
            Find NOIR Café and SASSO across four global destinations.
          </p>
        </motion.div>
      </section>

      {/* Locations grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          {locations.map((loc, ci) => (
            <motion.div
              key={loc.city}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: ci * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-4 h-4 text-primary/50" />
                <h2 className="text-2xl md:text-3xl font-display tracking-wide text-foreground">{loc.city}</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loc.venues.map((venue, vi) => (
                  <motion.div
                    key={venue.name}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: vi * 0.05 }}
                    className="group p-6 rounded-xl border border-border/10 bg-card/20 hover:border-primary/15 hover:bg-card/40 transition-all duration-500"
                  >
                    <div className={`w-8 h-[2px] mb-4 rounded-full ${venue.brand === "noir" ? "bg-neon-purple/30" : "bg-primary/30"}`} />
                    <h3 className="text-sm font-body font-medium text-foreground tracking-wide mb-1">
                      {venue.name}
                    </h3>
                    <p className="text-xs text-muted-foreground/40">{venue.area}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
