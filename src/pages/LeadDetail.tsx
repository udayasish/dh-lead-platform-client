import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { leadsApi } from "../api/leads";
import { usersApi, type TeamMember } from "../api/users";
import ActivityTrail from "../components/ActivityTrail";
import {
  Button,
  Select,
  Spinner,
  StatusBadge,
  Textarea,
} from "../components";
import { useAppSelector } from "../store/hooks";
import { canModifyLead, isAdmin } from "../utils/permissions";
import { formatDateTime, titleCase } from "../utils/format";
import { LEAD_STATUSES, type LeadDetail as LeadDetailType, type LeadStatus } from "../types/lead";

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-800 dark:text-slate-200">{value || "—"}</dd>
    </div>
  );
}

function LeadDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [lead, setLead] = useState<LeadDetailType | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const admin = isAdmin(user);
  const canModify = lead ? canModifyLead(user, lead) : false;

  // Members can't list users, so keep the current assignee as an option or the
  // select would fall back to "Unassigned".
  const assigneeOptions = useMemo(() => {
    const options = [{ value: "", label: "Unassigned" }];
    if (admin) {
      options.push(...team.map((m) => ({ value: m.id, label: m.name })));
    } else if (lead?.assignee) {
      options.push({ value: lead.assignee.id, label: lead.assignee.name });
    }
    return options;
  }, [admin, team, lead]);

  const load = useCallback(async () => {
    try {
      setLead(await leadsApi.get(id));
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? "This lead no longer exists."
          : "Could not load this lead."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!admin) return;
    usersApi
      .search()
      .then((res) => setTeam(res.data))
      .catch(() => setTeam([]));
  }, [admin]);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "That action failed."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await leadsApi.remove(id);
      navigate("/leads", { replace: true });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Delete failed.");
      setBusy(false);
    }
  };

  if (loading) return <Spinner label="Loading lead…" />;

  if (error || !lead) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <p className="text-gray-700 dark:text-slate-300">{error}</p>
        <Link to="/leads">
          <Button variant="secondary" className="mt-4">
            Back to leads
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link to="/leads" className="text-sm text-gray-500 hover:underline dark:text-slate-400">
        ← Back to leads
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{lead.name}</h1>
            <StatusBadge status={lead.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{lead.email}</p>
        </div>
        {admin && (
          <Button variant="danger" onClick={handleDelete} disabled={busy}>
            Delete
          </Button>
        )}
      </div>

      {actionError && (
        <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {actionError}
        </p>
      )}

      {!canModify && (
        <p className="mt-4 rounded-xl border border-hairline bg-gray-50 px-3.5 py-2.5 text-sm text-gray-600 dark:border-hairline-dark dark:bg-slate-800/50 dark:text-slate-400">
          You can only edit leads assigned to you, so this one is read-only.
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-hairline bg-white dark:border-hairline-dark dark:bg-surface-dark p-5">
            <h2 className="mb-4 text-[15px] font-semibold">Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Phone" value={lead.phone} />
              <Field label="Company" value={lead.company} />
              <Field label="Source" value={lead.source} />
              <Field label="Created" value={formatDateTime(lead.createdAt)} />
            </dl>
            {lead.message && (
              <div className="mt-5 border-t border-hairline pt-4 dark:border-hairline-dark">
                <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">
                  Their message
                </dt>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-gray-800 dark:text-slate-200">
                  {lead.message}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-hairline bg-white dark:border-hairline-dark dark:bg-surface-dark p-5">
            <h2 className="mb-4 text-[15px] font-semibold">Notes</h2>
            {canModify && (
              <div className="mb-5">
                <Textarea
                  rows={3}
                  placeholder="Add a note…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button
                  className="mt-2"
                  disabled={busy || !note.trim()}
                  onClick={() =>
                    run(async () => {
                      await leadsApi.addNote(id, note.trim());
                      setNote("");
                    })
                  }
                >
                  Add note
                </Button>
              </div>
            )}
            {lead.notes.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400">No notes yet.</p>
            ) : (
              <ul className="space-y-4">
                {lead.notes.map((item) => (
                  <li key={item.id} className="rounded-xl bg-gray-50 p-3.5 dark:bg-slate-800/50">
                    <p className="text-sm text-gray-800 dark:text-slate-200">{item.body}</p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                      {item.author.name} · {formatDateTime(item.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-hairline bg-white dark:border-hairline-dark dark:bg-surface-dark p-5">
            <h2 className="mb-4 text-[15px] font-semibold">Pipeline</h2>
            <Select
              label="Status"
              disabled={!canModify || busy}
              value={lead.status}
              options={LEAD_STATUSES.map((s) => ({ value: s, label: titleCase(s) }))}
              onValueChange={(next) =>
                run(() => leadsApi.changeStatus(id, next as LeadStatus))
              }
            />
            <div className="mt-4">
              <Select
                label="Assigned to"
                disabled={!admin || busy}
                value={lead.assignedToId ?? ""}
                options={assigneeOptions}
                onValueChange={(next) =>
                  run(() => leadsApi.assign(id, next || null))
                }
              />
              {!admin && (
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                  Only admins can reassign leads.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-hairline bg-white dark:border-hairline-dark dark:bg-surface-dark p-5">
            <h2 className="mb-4 text-[15px] font-semibold">Activity</h2>
            <ActivityTrail activities={lead.activities} />
          </section>
        </div>
      </div>
    </div>
  );
}

export default LeadDetail;
