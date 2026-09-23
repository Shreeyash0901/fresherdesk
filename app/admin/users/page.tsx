import { getAdminUsersList } from "@/app/actions/admin-users";
import { UsersRolesClient } from "@/components/fresherdesk/users-roles-client";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/leads");
  }

  const params = await searchParams;
  const users = await getAdminUsersList(params);

  return <UsersRolesClient users={users} currentAdminId={session.userId} />;
}
