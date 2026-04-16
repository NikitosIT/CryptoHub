import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';

import { useAuthListener } from './routes/auth/-api/useAuthListener';
import { routeTree } from './routes/routeTree.gen';

import './index.css';

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
declare module '@tanstack/router-core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: typeof router;
  }
}

function RootWithProviders() {
  useAuthListener();
  return <RouterProvider router={router} />;
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RootWithProviders />
    </QueryClientProvider>
  </React.StrictMode>,
);
