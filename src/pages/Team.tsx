import { useEffect, useState } from "react";
import { usersApi, type TeamMember } from "../api/users";
import { EmptyState, Spinner } from "../components";
import { formatDate } from "../utils/format";

function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi
      .search()
      .then((res) => setMembers(res.data))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Team</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
        People who can be assigned leads.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-hairline bg-white dark:border-hairline-dark dark:bg-surface-dark">
        {loading ? (
          <Spinner label="Loading team…" />
        ) : members.length === 0 ? (
          <EmptyState title="No team members found" />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-hairline bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:border-hairline-dark dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-medium">Name</th>
                <th className="px-5 py-3.5 font-medium">Email</th>
                <th className="px-5 py-3.5 font-medium">Role</th>
                <th className="px-5 py-3.5 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {members.map((member) => (
                <tr key={member.id} className="transition hover:bg-gray-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-slate-100">
                    {member.name}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-slate-300">{member.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs uppercase tracking-wide text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-slate-400">
                    {formatDate(member.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Team;
