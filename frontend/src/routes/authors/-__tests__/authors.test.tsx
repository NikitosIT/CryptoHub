import { beforeEach, describe, expect, it, vi } from "vitest";

import { supabase } from "@/lib/supabaseClient";

vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockAuthorsResponse = [
  {
    author_name: "Дневник Активов",
    tg_author_id: -1002032526418,
  },
  {
    author_name: "Криптомнения",
    tg_author_id: -1002385347235,
  },
];

describe("Authors Api request", () => {
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

  it("should return authors with correct data structure (author_name, tg_author_id)", async () => {
    mockOverrideTypes.mockResolvedValueOnce({
      data: mockAuthorsResponse,
      error: null,
    });
    const { data, error } = await supabase
      .from("authors")
      .select("*")
      .overrideTypes<typeof mockAuthorsResponse>();

    expect(mockFrom).toHaveBeenCalledWith("authors");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(error).toBeNull();
    expect(data).toHaveLength(2);

    data?.forEach((author) => {
      expect(author).toHaveProperty("author_name");
      expect(author).toHaveProperty("tg_author_id");
    });

    expect(data?.[0]).toEqual({
      author_name: "Дневник Активов",
      tg_author_id: -1002032526418,
    });
  });
});
