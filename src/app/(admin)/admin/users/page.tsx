import { UsersTable } from "@/components/admin/UsersTable";
import { getAdminUsers } from "@/lib/analytics/service";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const pageSize = 100;
  const users = await getAdminUsers(pageSize, (currentPage - 1) * pageSize);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-sm text-slate-600">
        Monitoring view of user activity and subscription tiers. Page {currentPage}.
      </p>
      <UsersTable rows={users} />
      <div className="flex gap-3 text-sm">
        {currentPage > 1 && (
          <a className="text-primary underline" href={`?page=${currentPage - 1}`}>
            ← Previous
          </a>
        )}
        {users.length === pageSize && (
          <a className="text-primary underline" href={`?page=${currentPage + 1}`}>
            Next →
          </a>
        )}
      </div>
    </div>
  );
}
