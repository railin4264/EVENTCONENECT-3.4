'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { WatchlistProvider } from '@/components/providers/WatchlistProvider';
import { DynamicThemeProvider } from '@/contexts/DynamicThemeContext';
import { ImmersiveNotificationSystem } from '@/components/notifications/ImmersiveNotifications';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  // Create a client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
      mutations: {
        retry: 1,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <DynamicThemeProvider>
        <ImmersiveNotificationSystem>
          <ThemeProvider>
            <AuthProvider>
              <WatchlistProvider>
                {children}
                {process.env.NODE_ENV === 'development' && (
                  <ReactQueryDevtools />
                )}
              </WatchlistProvider>
            </AuthProvider>
          </ThemeProvider>
        </ImmersiveNotificationSystem>
      </DynamicThemeProvider>
    </QueryClientProvider>
  );
};

export default Providers;
