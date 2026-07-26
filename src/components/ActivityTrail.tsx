import { formatDateTime } from "../utils/format";
import type { LeadActivity, LeadActivityType } from "../types/lead";

const dotColors: Record<LeadActivityType, string> = {
  created: "bg-blue-500",
  status_changed: "bg-violet-500",
  assigned: "bg-amber-500",
  note_added: "bg-gray-400",
};

const labels: Record<LeadActivityType, string> = {
  created: "Created",
  status_changed: "Status changed",
  assigned: "Assignment",
  note_added: "Note added",
};

function ActivityTrail({ activities }: { activities: LeadActivity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-slate-400">No activity yet.</p>;
  }

  return (
    <ol className="relative space-y-5 border-l border-hairline pl-6 dark:border-hairline-dark">
      {activities.map((activity) => (
        <li key={activity.id} className="relative">
          <span
            className={`absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-surface-dark ${dotColors[activity.type]}`}
          />
          <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
            {labels[activity.type]}
          </p>
          {activity.detail && (
            <p className="text-sm text-gray-600 dark:text-slate-400">{activity.detail}</p>
          )}
          <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
            {formatDateTime(activity.createdAt)} ·{" "}
            {activity.actorName ?? "Public form"}
          </p>
        </li>
      ))}
    </ol>
  );
}

export default ActivityTrail;
