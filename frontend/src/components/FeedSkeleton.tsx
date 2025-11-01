export default function FeedSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto mt-12 space-y-6 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="w-full p-5 border shadow-md border-gray-700/50 rounded-2xl bg-neutral-900"
        >
          <div className="h-48 mb-4 bg-neutral-800 rounded-xl" />
          <div className="w-3/4 h-3 mb-3 rounded bg-neutral-800" />
          <div className="w-2/4 h-3 mb-3 rounded bg-neutral-800" />
          <div className="w-1/3 h-3 rounded bg-neutral-800" />
        </div>
      ))}
    </div>
  );
}

//PostSkeleton
