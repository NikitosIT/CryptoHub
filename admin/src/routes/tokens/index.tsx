import { createFileRoute } from "@tanstack/react-router";

import { createRouteGuard } from "@/hooks/routeGuards";
import { formatPrice } from "@/utils/formatPrice";
import { useListCryptoTokens } from "./api/useListCryptoTokens";
import { useMutateTokens } from "./api/useMutateTokens";

export const Route = createFileRoute("/tokens/")({
  beforeLoad: createRouteGuard({
    requireAuth: true,
  }),
  component: ListTokens,
});

function ListTokens() {
  const { data, error, isLoading } = useListCryptoTokens();
  const { handleAddAll, insertAll, insertOne, addedTokens, handleAddOne } =
    useMutateTokens();
  if (error) return <p className="text-center text-red-500">{error.message}</p>;
  if (isLoading) return <p className="text-sm text-center">Loading...</p>;

  return (
    <div className="max-w-2xl px-4 py-6 mx-auto">
      <h1 className="mb-6 text-2xl font-semibold text-white">
        Cryptotokens List
      </h1>

      <button
        onClick={handleAddAll}
        disabled={insertAll.isPending}
        className="block px-4 py-1.5 m-auto mb-4 text-sm text-white cursor-pointer bg-zinc-600 hover:bg-zinc-500 disabled:opacity-50 rounded-2xl transition-colors"
      >
        {insertAll.isPending
          ? "Adding..."
          : insertAll.isSuccess
            ? "All added"
            : "Add all to database"}
      </button>

      {insertAll.isError && (
        <p className="mb-4 text-sm text-center text-red-400">
          {insertAll.error instanceof Error
            ? insertAll.error.message
            : "Failed to add tokens"}
        </p>
      )}

      <ul className="divide-y divide-gray-700">
        {data?.map((token) => {
          const isAdded = addedTokens.has(token.name);

          return (
            <li
              key={token.id}
              className="flex items-center gap-4 py-4 first:pt-0"
            >
              <img
                src={token.image}
                alt={token.name}
                className="object-contain w-10 h-10 bg-black rounded-full shrink-0"
              />
              <span className="flex-1 font-medium text-white">
                {token.name}
              </span>
              <button
                onClick={() => handleAddOne(token.name)}
                disabled={isAdded || insertOne.isPending}
                className="p-1 transition-opacity disabled:opacity-40"
                title={isAdded ? "Already added" : `Add ${token.name}`}
              >
                <img
                  className="w-6"
                  src="/free-icon-send-3106856.png"
                  alt="send"
                />
              </button>
              <span className="text-gray-300 tabular-nums">
                {formatPrice(token.current_price)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
