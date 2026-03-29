import { ReactNode } from "react";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

interface PublicLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export default function PublicLayout({ children, showFooter = true }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <PublicNavbar />
      <main>{children}</main>
      {showFooter && <PublicFooter />}
    </div>
  );
}
