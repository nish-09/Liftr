import { getUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { UserProvider } from "@/components/common/UserContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // Defense-in-depth: Fail closed if user session is missing
  if (!user) {
    redirect("/login");
  }

  const userDisplayName = user.user_metadata?.display_name || null;
  const userEmail = user.email || null;

  return (
    <UserProvider userId={user.id} displayName={userDisplayName} email={userEmail}>
      <DashboardShell userDisplayName={userDisplayName} userEmail={userEmail}>
        {children}
      </DashboardShell>
    </UserProvider>
  );
}
