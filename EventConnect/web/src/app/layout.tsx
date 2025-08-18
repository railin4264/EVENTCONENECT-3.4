import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'EventConnect AI - Descubre Eventos y Comunidades',
  description: 'Plataforma universal de eventos que conecta personas con intereses similares usando IA para recomendaciones inteligentes.',
  keywords: ['eventos', 'comunidades', 'IA', 'recomendaciones', 'tribus', 'actividades'],
  authors: [{ name: 'EventConnect Team' }],
  creator: 'EventConnect',
  publisher: 'EventConnect',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://eventconnect.com'),
  openGraph: {
    title: 'EventConnect AI - Descubre Eventos y Comunidades',
    description: 'Plataforma universal de eventos que conecta personas con intereses similares usando IA para recomendaciones inteligentes.',
    url: 'https://eventconnect.com',
    siteName: 'EventConnect',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EventConnect AI',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EventConnect AI - Descubre Eventos y Comunidades',
    description: 'Plataforma universal de eventos que conecta personas con intereses similares usando IA para recomendaciones inteligentes.',
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  themeColor: '#0ea5e9',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
