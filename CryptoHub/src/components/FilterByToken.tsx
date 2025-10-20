import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useTokens } from "@/store/useTokens";
import { supabase } from "@/lib/supabaseClient";
import type { Token } from "@/types/token&authorType";
import PredictionPrice from "./PridictionPrice";
import { useQuery } from "@tanstack/react-query";

export default function Tokens() {
  const { selectedToken, setSelectedToken } = useTokens();

  const {
    data: tokens,
    isLoading,
    error,
  } = useQuery<Token[]>({
    queryKey: ["cryptotokens"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cryptotokens").select("*");
      if (error) throw error;
      return data.map((token) => ({
        label: token.token_name,
        value: token.token_name,
        logo: token.token_logo,
        cmc: token.cmc_link,
        coinglass: token.coinglass_link,
        homelink: token.home_link,
        xlink: token.x_link,
      }));
    },
  });

  if (isLoading) return <p className="text-gray-400">Загрузка...</p>;
  if (error) return <p className="text-red-500">Ошибка: {error.message}</p>;
  const safeTokens = tokens ?? [];

  return (
    <div className="flex flex-col items-center pb-4 bg-black">
      <Autocomplete
        disablePortal
        options={safeTokens}
        getOptionLabel={(opt) => opt.label}
        onChange={(_, value) => setSelectedToken(value ?? null)}
        renderOption={(props, option, { index }) => (
          <>
            <li
              {...props}
              className="flex items-center justify-between gap-2 px-3 py-2 bg-[#121212] hover:bg-[#1e1e1e] text-gray-200 cursor-pointer transition-colors duration-150"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6">
                  <img
                    src={option.logo}
                    alt={option.label}
                    className="object-contain w-5 h-5"
                  />
                </div>
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </li>

            {/* Разделитель между элементами */}
            {index < safeTokens.length - 1 && (
              <hr className="border-t border-gray-700 opacity-40" />
            )}
          </>
        )}
        sx={{
          width: 300,
          "& .MuiInputBase-root": {
            backgroundColor: "#111",
            color: "#fff",
            borderRadius: "8px",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#444",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#777",
          },
          "& .MuiSvgIcon-root": {
            color: "#fff",
          },
          "& .MuiInputLabel-root": {
            color: "#aaa",
          },
          "& .MuiAutocomplete-listbox": {
            backgroundColor: "#121212",
            paddingTop: 0,
            paddingBottom: 0,
          },
        }}
        renderInput={(params) => <TextField {...params} label="Выбери токен" />}
      />

      {/* 🔽 Блок со ссылками */}
      {selectedToken && (
        <div className="flex flex-col items-center mt-4 text-sm text-gray-300">
          <div className="flex items-center gap-2 px-4 py-2 mb-2 bg-gray-700 rounded-3xl">
            <img
              src={selectedToken.logo}
              alt={selectedToken.label}
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="text-lg font-semibold text-white">
              {selectedToken.label}
            </span>
          </div>

          <div className="mt-6 p-4 bg-[#111] rounded-2xl shadow-md flex flex-wrap gap-3 justify-center">
            {/* CoinMarketCap */}
            {selectedToken.cmc && (
              <a
                href={selectedToken.cmc}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                >
                  <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                </svg>
                CoinMarketCap
              </a>
            )}

            {/* Coinglass */}
            {selectedToken.coinglass && (
              <a
                href={selectedToken.coinglass}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-purple-600 rounded-lg hover:bg-purple-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2z" />
                </svg>
                Coinglass
              </a>
            )}

            {/* Official site */}
            {selectedToken.homelink && (
              <a
                href={selectedToken.homelink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-orange-600 rounded-lg hover:bg-orange-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                >
                  <path d="M12 3l9 9h-3v9h-12v-9h-3l9-9z" />
                </svg>
                Official site
              </a>
            )}

            {/* X */}
            {selectedToken.xlink && (
              <a
                href={selectedToken.xlink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-gray-700 rounded-lg hover:bg-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M18.36 3H21l-6.51 7.43L22 21h-5.64l-4.36-5.19L7.28 21H3l6.9-7.88L2 3h5.64l4 4.77L18.36 3z" />
                </svg>
                X
              </a>
            )}

            <PredictionPrice />
          </div>
        </div>
      )}
    </div>
  );
}
