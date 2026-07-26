function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-12 text-sm text-gray-500 dark:text-slate-400">
      <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-400" />
      {label}
    </div>
  );
}

export default Spinner;
