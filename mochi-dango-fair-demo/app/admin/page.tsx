import { redirect } from "next/navigation";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { getSessionUserFromCookies } from "@/lib/auth";

// Server component for admin dashboard entry.
export default function AdminPage() {
  const session = getSessionUserFromCookies();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    redirect("/login");
  }

  return <AdminDashboardClient />;
}
