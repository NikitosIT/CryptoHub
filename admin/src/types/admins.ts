export interface TokenForecast {
  id: number;
  token_name: string;
  forecast_text: string;
  sentiment: "positive" | "neutral" | "negative";
  source_url: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface ForecastsResponse {
  success: boolean;
  forecasts?: TokenForecast[];
  error?: string;
}

export interface CheckEmailResponse {
  success: boolean;
  exists?: boolean;
  error?: string;
}
