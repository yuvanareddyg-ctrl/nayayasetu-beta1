import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin — Login Records | NyayaSetu",
  description: "Protected administration panel for login audit records.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
