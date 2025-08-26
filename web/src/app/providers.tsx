'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { WatchlistProvider } from '@/components/providers/WatchlistProvider';
import { DynamicThemeProvider } from '@/contexts/DynamicThemeContext';
import { ImmersiveNotificationSystem } from '@/components/notifications/ImmersiveNotifications';
import { EventConnectProvider, NetworkStatus } from '@/contexts/EventConnectContext';

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
      <EventConnectProvider>
        <DynamicThemeProvider>
          <ImmersiveNotificationSystem>
            <ThemeProvider>
              <AuthProvider>
                <WatchlistProvider>
                  <NetworkStatus />
                  {children}
                  {process.env.NODE_ENV === 'development' && (
                    <ReactQueryDevtools />
                  )}
                </WatchlistProvider>
              </AuthProvider>
            </ThemeProvider>
          </ImmersiveNotificationSystem>
        </DynamicThemeProvider>
      </EventConnectProvider>
    </QueryClientProvider>
  );
};

export default Providers;
