/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { useSearch } from "@tanstack/react-router";

import type { PostMode } from "@/types/db";

export const usePostsMode = (): { mode: PostMode } => {
  const search = useSearch({ strict: false }) as {
    mode?: PostMode;
  };

  return {
    mode: search.mode ?? "all",
  };
};
