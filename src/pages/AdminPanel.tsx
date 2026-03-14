import { AIPersonalityProvider } from "@/contexts/AIPersonalityContext";
import AdminDashboardLayout from "@/components/admin/layout/AdminDashboardLayout";

export default function AdminPanel() {
  return (
    <AIPersonalityProvider>
      <AdminDashboardLayout />
    </AIPersonalityProvider>
  );
}
