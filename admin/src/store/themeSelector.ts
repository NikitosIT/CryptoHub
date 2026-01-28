import type { RootState } from "./store";
import type { Theme } from "./themeSlice";

export const selectThemeMode = (state: RootState): Theme => state.theme.mode;
