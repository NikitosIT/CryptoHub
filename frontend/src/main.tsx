import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { useAuthListener } from "./api/useAuthListener";
import { ToastProvider } from "./hooks/useToast";
import { supabase } from "./lib/supabaseClient";
import { routeTree } from "./routes/routeTree.gen";
import { theme } from "./theme";

import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      onError: (error: unknown) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again later.";
        console.error(errorMessage);
      },
    },
  },
});

export const REACT_QUERY_CACHE_KEY = "REACT_QUERY_OFFLINE_CACHE";

export const persister = createAsyncStoragePersister({
  storage: window.localStorage,
  key: REACT_QUERY_CACHE_KEY,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

export { queryClient };
const router = createRouter({ routeTree });

function RootWithProviders() {
  useAuthListener();
  return <RouterProvider router={router} />;
}

function Root() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: Infinity,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            return query.queryKey[0] === "twoFactorStatus";
          },
        },
        buster: "",
      }}
    >
      <ToastProvider>
        <RootWithProviders />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </ToastProvider>
    </PersistQueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionContextProvider supabaseClient={supabase}>
        <Root />
      </SessionContextProvider>
    </ThemeProvider>
  </StrictMode>,
);
