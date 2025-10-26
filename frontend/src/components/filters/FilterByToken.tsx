import { useTokensStore } from "@/store/useTokensStore";
import PredictionPrice from "../PridictionPrice";
import { useTokens } from "@/api/useTokens";
import SelectFilter from "./CustomSelectFilter";
import type { Token } from "@/types/TokenAndAuthorTypes";
import FilterSkeleton from "./FilterSkeleton";
import NoPostsMessage from "../NoPostsMessage";

export default function Tokens() {
  const { selectedToken, setSelectedToken } = useTokensStore();
  const { data: tokens, isLoading, error } = useTokens();

  if (isLoading) return <FilterSkeleton />;
  if (error) return <p className="text-red-500">Ошибка: {error.message}</p>;

  const safeTokens = tokens ?? [];

  return (
    <div className="flex flex-col items-center justify-start pb-4 bg-black">
      <div className="flex items-center justify-center bg-black">
        <SelectFilter<Token>
          label="Выбери токен"
          options={safeTokens}
          value={selectedToken}
          onChange={(val) => setSelectedToken(val ?? null)}
          loading={isLoading}
          showLogos
        />
      </div>

      {selectedToken && (
        <div className="flex flex-col items-center mt-4 text-sm text-gray-300 transition-all duration-300">
          {/* Название токена */}
          <div className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#111]  border border-gray-800 shadow-md rounded-3xl shadow-black/50">
            <img
              src={`/tokens/${selectedToken.label}.svg`}
              alt={selectedToken.label}
              width={30}
              height={30}
              className="object-contain rounded-full"
              onError={(e) => {
                e.currentTarget.src = `/tokens/${selectedToken.label}.png`;
              }}
            />
            <span className="text-lg font-semibold tracking-wide text-white">
              {selectedToken.label}
            </span>
          </div>

          {/* Ссылки */}
          <div className="flex flex-wrap justify-center gap-3 p-4 bg-[#111] rounded-2xl shadow-md border border-gray-800">
            {selectedToken.cmc && (
              <a
                href={selectedToken.cmc}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                <img
                  width={20}
                  height={20}
                  src="/links_logo/cmc.svg"
                  alt="cmc"
                />
                <span>CoinMarketCap</span>
              </a>
            )}

            {selectedToken.coinglass && (
              <a
                href={selectedToken.coinglass}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                <img
                  width={20}
                  height={20}
                  src="/links_logo/coinglass.png"
                  alt="coinglass"
                />
                <span>Coinglass</span>
              </a>
            )}

            {selectedToken.homelink && (
              <a
                href={selectedToken.homelink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-orange-600 rounded-lg hover:bg-orange-500"
              >
                <img
                  width={20}
                  height={20}
                  src="/links_logo/home.svg"
                  alt="home"
                />
                <span>Official site</span>
              </a>
            )}

            {selectedToken.xlink && (
              <a
                href={selectedToken.xlink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-gray-700 rounded-lg hover:bg-gray-500"
              >
                <img
                  width={20}
                  height={20}
                  src="/links_logo/x-2.svg"
                  alt="home"
                />
              </a>
            )}

            <PredictionPrice />
          </div>

          {/* 🔹 Если нет постов про этот токен */}
          <NoPostsMessage tokenName={selectedToken.label} />
        </div>
      )}
    </div>
  );
}
