export function FeedSkeleton() {
  return (
    <div className="flex flex-col items-center w-full max-w-2xl space-y-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 p-5 animate-pulse"
        >
          <div className="h-48 bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-4" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-2" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/4 mb-3" />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}
