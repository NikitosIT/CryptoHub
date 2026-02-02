import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PostsTelegram } from "@/routes/posts/-components/PostsTelegram";
import * as useFiltersForModeModule from "@/store/useFiltersStore";

vi.mock("@/store/useFiltersStore");
vi.mock("@/routes/authors/-components/FilterByAuthors", () => ({
  __esModule: true,
  default: () => <div>Select author</div>,
}));
vi.mock("@/routes/tokens/-components/FilterByToken", () => ({
  __esModule: true,
  default: () => <div>Select token</div>,
}));
vi.mock("@/routes/posts/-components/PostsList", () => ({
  __esModule: true,
  default: () => <div>PostsList</div>,
}));
vi.mock("@/routes/tokens/-components/TokenDetails", () => ({
  TokenDetails: () => <div>TokenDetails</div>,
}));

describe("PostsTelegram", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFiltersForModeModule.useFiltersForMode).mockReturnValue({
      selectedAuthorId: null,
      selectedToken: null,
      setSelectedAuthorId: vi.fn(),
      setSelectedToken: vi.fn(),
    });
  });

  it("renders Select author and Select token filters", () => {
    render(<PostsTelegram />);
    expect(screen.getByText("Select author")).toBeTruthy();
    expect(screen.getByText("Select token")).toBeTruthy();
  });

  it("renders PostsList", () => {
    render(<PostsTelegram />);
    expect(screen.getByText("PostsList")).toBeTruthy();
  });

  it("renders TokenDetails when selectedToken is set", () => {
    vi.mocked(useFiltersForModeModule.useFiltersForMode).mockReturnValue({
      selectedAuthorId: null,
      selectedToken: {
        label: "BTC",
        value: "BTC",
        cmc: "",
        coinglass: "",
        homelink: "",
        xlink: "",
      },
      setSelectedAuthorId: vi.fn(),
      setSelectedToken: vi.fn(),
    });

    render(<PostsTelegram />);
    expect(screen.getByText("TokenDetails")).toBeTruthy();
  });
});
