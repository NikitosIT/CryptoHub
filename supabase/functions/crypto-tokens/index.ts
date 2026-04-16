import { handleOptions } from "../shared/cors.ts";
import { errorResponse, jsonResponse } from "../shared/responses.ts";
import { safeLogError } from "../shared/logger.ts";

const COINGECKO_MARKETS_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleOptions(req);
  }

  const apiKey = Deno.env.get("COINGECKO_KEY");
  if (!apiKey) {
    safeLogError(new Error("COINGECKO_KEY is not set"), "crypto-tokens");
    return errorResponse("Service not configured", 503, req);
  }

  try {
    const url = `${COINGECKO_MARKETS_URL}&x_cg_demo_api_key=${apiKey}`;
    console.log("Fetching CoinGecko...");
    const res = await fetch(url);
    console.log("Fetched CoinGecko");

    if (!res.ok) {
      const text = await res.text();
      safeLogError(
        new Error(`CoinGecko API error: ${res.status} ${text}`),
        "crypto-tokens",
      );
      return errorResponse("Failed to fetch token data", 502, req);
    }

    const data = await res.json();
    return jsonResponse(data, 200, req);
  } catch (err: unknown) {
    safeLogError(err, "crypto-tokens");
    const message = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(message, 500, req);
  }
});
