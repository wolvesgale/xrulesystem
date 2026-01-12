import { redirect } from "next/navigation";
import { AgentDashboardClient } from "@/components/AgentDashboardClient";
import { getSessionUserFromCookies } from "@/lib/auth";

// Server component for agent dashboard entry.
export default function AgentPage() {
  const session = getSessionUserFromCookies();
  if (!session || session.role !== "agent") {
    redirect("/login");
  }

  return <AgentDashboardClient agencyId={session.agencyId} />;
}
