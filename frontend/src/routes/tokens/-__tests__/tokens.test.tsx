import { beforeEach, describe, expect, it, vi } from "vitest";

import { supabase } from "@/lib/supabaseClient";

// Mock supabase
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Sample token data matching the cryptotokens table response
const mockTokensResponse = [
  {
    id: 17,
    token_name: "LINK",
    cmc_link: "chainlink/",
    home_link: "https://chain.link/",
    x_link: "chainlink",
    priority: null,
  },
  {
    id: 18,
    token_name: "XLM",
    cmc_link: "stellar/",
    home_link: "https://stellar.org/",
    x_link: "StellarOrg",
    priority: null,
  },
  
];

describe("Tokens API - cryptotokens response", () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const mockFrom = vi.mocked(supabase.from);
  const mockSelect = vi.fn();
  const mockOverrideTypes = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({
      select: mockSelect,
    } as never);

    mockSelect.mockReturnValue({
      overrideTypes: mockOverrideTypes,
    } as never);
  });

  it("should return tokens with correct data structure (id, token_name, cmc_link, home_link, x_link, priority)", async () => {
    mockOverrideTypes.mockResolvedValueOnce({
      data: mockTokensResponse,
      error: null,
    });

    // Supabase request
    const { data, error } = await supabase
      .from("cryptotokens")
      .select("*")
      .overrideTypes<typeof mockTokensResponse>();

    // Verify request was made to correct table
    expect(mockFrom).toHaveBeenCalledWith("cryptotokens");
    expect(mockSelect).toHaveBeenCalledWith("*");

    // Verify no error
    expect(error).toBeNull();

    // Verify response data has correct structure
    expect(data).toHaveLength(2);

    // Check each token has required fields
    data?.forEach((token) => {
      expect(token).toHaveProperty("id");
      expect(token).toHaveProperty("token_name");
      expect(token).toHaveProperty("cmc_link");
      expect(token).toHaveProperty("home_link");
      expect(token).toHaveProperty("x_link");
      expect(token).toHaveProperty("priority");
    });

    // Verify first token data matches expected
    expect(data?.[0]).toEqual({
      id: 17,
      token_name: "LINK",
      cmc_link: "chainlink/",
      home_link: "https://chain.link/",
      x_link: "chainlink",
      priority: null,
    });
  });
});
