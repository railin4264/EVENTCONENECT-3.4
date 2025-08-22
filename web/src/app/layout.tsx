import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { DynamicThemeProvider } from '@/contexts/DynamicThemeContext';
import { ImmersiveNotificationSystem } from '@/components/notifications/ImmersiveNotifications';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EventConnect - Conecta con tu Tribu',
  description: 'Descubre eventos increíbles, únete a comunidades apasionadas y crea conexiones que duran toda la vida. La plataforma social más avanzada para conectar con eventos y tribus.',
  keywords: 'eventos, comunidades, tribus, social, networking, eventos cerca de mí, grupos sociales',
  authors: [{ name: 'EventConnect Team' }],
  creator: 'EventConnect',
  publisher: 'EventConnect',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://eventconnect.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'EventConnect - Conecta con tu Tribu',
    description: 'Descubre eventos increíbles, únete a comunidades apasionadas y crea conexiones que duran toda la vida.',
    url: 'https://eventconnect.app',
    siteName: 'EventConnect',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EventConnect - Plataforma de eventos y comunidades',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EventConnect - Conecta con tu Tribu',
    description: 'Descubre eventos increíbles, únete a comunidades apasionadas y crea conexiones que duran toda la vida.',
    images: ['/og-image.jpg'],
    creator: '@eventconnect',
    site: '@eventconnect',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'social networking',
  classification: 'social networking platform',
  other: {
    'theme-color': '#06b6d4',
    'msapplication-TileColor': '#06b6d4',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'EventConnect',
    'application-name': 'EventConnect',
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Meta tags for PWA */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#06b6d4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EventConnect" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/api/health" as="fetch" crossOrigin="anonymous" />
        
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "EventConnect",
              "description": "Plataforma social para eventos y comunidades",
              "url": "https://eventconnect.app",
              "applicationCategory": "SocialNetworkingApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Providers */}
        <DynamicThemeProvider>
          <ImmersiveNotificationSystem>
            <AuthProvider>
              <QueryProvider>
                <ThemeProvider>
                  {/* Main content */}
                  <main className="min-h-screen">
                    {children}
                  </main>
                  
                  {/* Global UI elements */}
                  <div id="portal-root" />
                  
                  {/* Performance monitoring */}
                  <script
                    dangerouslySetInnerHTML={{
                      __html: `
                        // Performance monitoring
                        if ('performance' in window) {
                          window.addEventListener('load', () => {
                            const perfData = performance.getEntriesByType('navigation')[0];
                            if (perfData) {
                              console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                            }
                          });
                        }
                        
                        // Service Worker registration
                        if ('serviceWorker' in navigator) {
                          navigator.serviceWorker.register('/sw.js')
                            .then(registration => console.log('SW registered'))
                            .catch(error => console.log('SW registration failed'));
                        }
                      `
                    }}
                  />
                </ThemeProvider>
              </QueryProvider>
            </AuthProvider>
          </ImmersiveNotificationSystem>
        </DynamicThemeProvider>
      </body>
    </html>
  );
}
