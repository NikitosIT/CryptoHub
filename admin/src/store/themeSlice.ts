import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "admin-theme-mode";

const isValidTheme = (value: string): value is Theme => {
  return value === "light" || value === "dark";
};

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved && isValidTheme(saved) ? saved : "dark";
};

const saveTheme = (theme: Theme): void => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: getInitialTheme() },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
      saveTheme(state.mode);
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.mode = action.payload;
      saveTheme(state.mode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
