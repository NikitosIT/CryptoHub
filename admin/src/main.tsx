import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { useAuthListener } from "./api/useAuthListener";
import "./index.css";
import { routeTree } from "./routes/routeTree.gen";
import { store } from "./store/store";
import ThemeProvider from "./store/ThemeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

export { queryClient };
const router = createRouter({ routeTree });

function RootWithProviders() {
  useAuthListener();
  return <RouterProvider router={router} />;
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RootWithProviders />
        </QueryClientProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
);
