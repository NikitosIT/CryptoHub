import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routes/routeTree.gen";
import { useAuthListener } from "./api/useAuthListener";

const queryClient = new QueryClient();
const router = createRouter({ routeTree });

function RootWithProviders() {
  useAuthListener();
  return <RouterProvider router={router} />;
}

function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootWithProviders />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
