import Button from "./Button";
import type { PageMeta } from "../api/client";

interface PaginationProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
}

function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, limit, total, totalPages } = meta;
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-hairline px-5 py-3.5 dark:border-hairline-dark">
      <p className="text-sm text-gray-500 dark:text-slate-400">
        Showing{" "}
        <span className="font-medium text-gray-800 dark:text-slate-200">{from}</span>–
        <span className="font-medium text-gray-800 dark:text-slate-200">{to}</span> of{" "}
        <span className="font-medium text-gray-800 dark:text-slate-200">{total}</span>
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-500 dark:text-slate-400">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
