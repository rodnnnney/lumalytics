'use client';

import Sidebar from '@/components/sidebar';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Note: metadata can only be exported from Server Components, so this won't work with 'use client'.
// If you need metadata, you'll need a different approach using a layout without 'use client'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient for each request
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 1000 * 60 * 5, // 5 minutes
            staleTime: 1000 * 60 * 1, // 1 minute
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen bg-gray-100">
        <Sidebar />
        <main className="pl-64 min-h-screen">
          <div className="p-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              {children}
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}
