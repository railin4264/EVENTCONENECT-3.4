import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { debugApp } from '@/lib/debug';
import Header from '@/components/layout/Header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EventConnect - Conecta con tu Tribu',
  description:
    'Descubre eventos increíbles, únete a comunidades apasionadas y crea conexiones que duran toda la vida. La plataforma social más avanzada para conectar con eventos y tribus.',
  keywords:
    'eventos, comunidades, tribus, social, networking, eventos cerca de mí, grupos sociales',
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
    description:
      'Descubre eventos increíbles, únete a comunidades apasionadas y crea conexiones que duran toda la vida.',
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
    description:
      'Descubre eventos increíbles, únete a comunidades apasionadas y crea conexiones que duran toda la vida.',
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
    <html lang='es' className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />

        {/* Favicon and app icons */}
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />

        {/* Meta tags for PWA */}
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
        />
        <meta name='theme-color' content='#06b6d4' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='EventConnect' />

        {/* next/font ya gestiona la precarga de Inter; se evita hardcodear rutas con hash */}

        {/* Structured data for SEO */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'EventConnect',
              description: 'Plataforma social para eventos y comunidades',
              url: 'https://eventconnect.app',
              applicationCategory: 'SocialNetworkingApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {/* Header Navigation */}
          <Header />
          
          {/* Main content */}
          <main className='min-h-screen pt-16'>{children}</main>

          {/* Global UI elements */}
          <div id='portal-root' />

          {/* Performance monitoring */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(){
                  try {
                    if ('performance' in window) {
                      if ('PerformanceObserver' in window) {
                        var obs = new PerformanceObserver(function(list){
                          var entries = list.getEntries();
                          var last = entries[entries.length - 1];
                          if (last) console.log('LCP:', last.startTime + 'ms');
                        });
                        obs.observe({ entryTypes: ['largest-contentful-paint'] });
                      }
                      window.addEventListener('load', function(){
                        var nav = performance.getEntriesByType('navigation')[0];
                        if (nav) console.log('Page Load Time:', nav.loadEventEnd - nav.loadEventStart, 'ms');
                      });
                    }
                    if (window.location.hostname === 'localhost') {
                      document.addEventListener('click', function(e){
                        var t = e.target;
                        if ((t && t.tagName === 'BUTTON') || (t && t.closest && t.closest('button'))) {
                          // console.log('Button clicked');
                        }
                      });
                      setTimeout(function(){
                        var buttons = document.querySelectorAll('button');
                        console.log('Buttons on page:', buttons.length);
                      }, 1000);
                    }
                    setTimeout(function(){
                      if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.register('/sw.js').then(function(){
                          console.log('SW registered');
                        }).catch(function(){});
                      }
                    }, 1000);
                  } catch(e){}
                })();
              `,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
