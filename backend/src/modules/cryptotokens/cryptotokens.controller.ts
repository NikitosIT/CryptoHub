import { Request, Response } from "express";

import { AppError } from "@/shared/utils/AppError.js";
import { asyncHandler } from "@/shared/utils/asyncHandler.js";
import { CryptoTokensSchema } from "@/shared/validators/validator.js";

const COINGECKO_MARKETS_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";

export const getCryptoTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const apiKey = process.env.COINGECKO_KEY;

    if (!apiKey) {
      throw new AppError("Service not configured", 503);
    }

    const url = `${COINGECKO_MARKETS_URL}&x_cg_demo_api_key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new AppError("API error", 502);
    }

    const data = CryptoTokensSchema.parse(await response.json());

    return res.json(data);
  },
);
