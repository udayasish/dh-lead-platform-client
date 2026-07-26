import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { ApiError } from "../api/client";
import { leadsApi } from "../api/leads";
import { usersApi, type TeamMember } from "../api/users";
import {
  Button,
  EmptyState,
  Input,
  Pagination,
  Select,
  Spinner,
  StatusBadge,
  Textarea,
} from "../components";
import { useDebounce } from "../hooks/useDebounce";
import {
  fetchLeads,
  setAssignee,
  setPage,
  setQuery,
  setStatus,
} from "../store/leadsSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { isAdmin } from "../utils/permissions";
import { formatDate, titleCase } from "../utils/format";
import { LEAD_STATUSES, type CaptureLeadInput, type LeadStatus } from "../types/lead";

const statusOptions = [
  { value: "", label: "All statuses" },
  ...LEAD_STATUSES.map((s) => ({ value: s, label: titleCase(s) })),
];

function NewLeadForm({ onCreated }: { onCreated: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CaptureLeadInput>();

  const onSubmit = async (data: CaptureLeadInput) => {
    setError(null);
    try {
      await leadsApi.create(data);
      reset();
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create lead");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-4 rounded-xl border border-hairline bg-white dark:border-hairline-dark dark:bg-surface-dark p-5"
    >
      <h2 className="mb-4 text-[15px] font-semibold">New lead</h2>
      {error && (
        <p className="mb-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Name *"
          error={errors.name?.message}
          {...register("name", { required: "Name is required" })}
        />
        <Input
          label="Email *"
          type="email"
          error={errors.email?.message}
          {...register("email", { required: "Email is required" })}
        />
        <Input label="Phone" {...register("phone")} />
        <Input label="Company" {...register("company")} />
      </div>
      <div className="mt-3">
        <Textarea
          label="Message"
          rows={3}
          placeholder="What are they looking for?"
          error={errors.message?.message}
          {...register("message", {
            maxLength: { value: 2000, message: "Please keep it under 2000 characters" },
          })}
        />
      </div>
      <Button type="submit" className="mt-4" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create lead"}
      </Button>
    </form>
  );
}

function Leads() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items, meta, loading, error, status, assignedToId, page } =
    useAppSelector((state) => state.leads);

  const [searchInput, setSearchInput] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showNewLead, setShowNewLead] = useState(false);
  const debouncedSearch = useDebounce(searchInput);

  const admin = isAdmin(user);

  useEffect(() => {
    dispatch(setQuery(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    void dispatch(fetchLeads());
  }, [dispatch, debouncedSearch, status, assignedToId, page]);

  // The users resource is admin-only; members filter by themselves instead.
  useEffect(() => {
    if (!admin) return;
    usersApi
      .search()
      .then((res) => setTeam(res.data))
      .catch(() => setTeam([]));
  }, [admin]);

  const assigneeOptions = useMemo(() => {
    const base = [
      { value: "", label: "Anyone" },
      { value: "unassigned", label: "Unassigned" },
    ];
    if (admin) {
      return [...base, ...team.map((m) => ({ value: m.id, label: m.name }))];
    }
    return [...base, { value: user?.id ?? "", label: "Assigned to me" }];
  }, [admin, team, user]);

  const reload = () => {
    setShowNewLead(false);
    void dispatch(fetchLeads());
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            {meta.total} {meta.total === 1 ? "lead" : "leads"} in the pipeline
          </p>
        </div>
        {admin && (
          <Button onClick={() => setShowNewLead((open) => !open)}>
            {showNewLead ? "Cancel" : "New lead"}
          </Button>
        )}
      </div>

      {showNewLead && admin && <NewLeadForm onCreated={reload} />}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search name, email or company…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select
          options={statusOptions}
          value={status}
          onValueChange={(next) => dispatch(setStatus(next as LeadStatus | ""))}
        />
        <Select
          options={assigneeOptions}
          value={assignedToId}
          onValueChange={(next) => dispatch(setAssignee(next))}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-hairline bg-white dark:border-hairline-dark dark:bg-surface-dark">
        {error && (
          <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <Spinner label="Loading leads…" />
        ) : items.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="Try clearing the filters, or share the public capture form to collect new leads."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-hairline bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 dark:border-hairline-dark dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Assignee</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {items.map((lead) => (
                  <tr key={lead.id} className="transition hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/leads/${lead.id}`}
                        className="font-medium text-gray-900 transition hover:text-primary-600 dark:text-slate-100 dark:hover:text-primary-400"
                      >
                        {lead.name}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{lead.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-slate-300">
                      {lead.company ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-slate-300">
                      {lead.assigneeName ?? (
                        <span className="text-gray-400 dark:text-slate-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-slate-400">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && items.length > 0 && (
          <Pagination
            meta={meta}
            onPageChange={(next) => dispatch(setPage(next))}
          />
        )}
      </div>
    </div>
  );
}

export default Leads;
