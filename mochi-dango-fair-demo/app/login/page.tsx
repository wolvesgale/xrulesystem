import { redirect } from "next/navigation";
import { getSessionUserFromCookies } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  const session = getSessionUserFromCookies();
  if (session?.role === "admin" || session?.role === "super_admin") {
    redirect("/admin");
  }
  if (session?.role === "agent") {
    redirect("/agent");
  }

  return <LoginForm />;
}
