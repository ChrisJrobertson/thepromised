import { UsersTable } from "@/components/admin/UsersTable";
import { getAdminUsers } from "@/lib/analytics/service";

export default async function AdminUsersPage() {
  const users = await getAdminUsers(500);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-sm text-slate-600">Monitoring view of user activity and subscription tiers.</p>
      <UsersTable rows={users} />
    </div>
  );
}
