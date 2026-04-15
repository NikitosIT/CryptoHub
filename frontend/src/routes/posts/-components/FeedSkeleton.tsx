export default function FeedSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl gap-3 mx-auto mt-12">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="w-full p-4 border shadow-sm rounded-xl border-gray-700/50 bg-neutral-900"
        >
          <div className="w-full h-48 mb-3 rounded-lg bg-neutral-800 animate-pulse" />
          <div className="w-3/4 h-3 mb-2 rounded bg-neutral-800 animate-pulse" />
          <div className="w-1/2 h-3 mb-2 rounded bg-neutral-800 animate-pulse" />
          <div className="w-1/3 h-3 rounded bg-neutral-800 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
