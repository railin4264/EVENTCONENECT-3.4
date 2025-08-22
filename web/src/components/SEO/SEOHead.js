import Head from 'next/head';
import { useRouter } from 'next/router';

const SEOHead = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  noIndex = false,
  noFollow = false,
  canonical,
  structuredData = null,
  twitterCard = 'summary_large_image',
  facebookAppId = null,
}) => {
  const router = useRouter();
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://eventconnect.com';

  // Valores por defecto
  const defaultTitle = 'EventConnect - Descubre Eventos y Tribus Increíbles';
  const defaultDescription =
    'Plataforma líder para descubrir eventos únicos y conectar con tribus cerca de ti. Encuentra eventos, únete a comunidades y vive experiencias inolvidables.';
  const defaultKeywords = [
    'eventos',
    'tribus',
    'comunidades',
    'conexiones sociales',
    'experiencias',
    'networking',
    'actividades',
    'grupos',
    'eventos cercanos',
    'social media',
    'eventos en vivo',
    'meetups',
    'conferencias',
    'workshops',
    'fiestas',
    'deportes',
    'arte',
    'música',
    'tecnología',
    'negocios',
    'educación',
  ];
  const defaultImage = `${baseUrl}/images/og-image.jpg`;

  // Combinar valores personalizados con valores por defecto
  const finalTitle = title ? `${title} | EventConnect` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = [...new Set([...defaultKeywords, ...keywords])];
  const finalImage = image || defaultImage;
  const finalUrl = url || `${baseUrl}${router.asPath}`;
  const finalCanonical = canonical || finalUrl;

  // Meta tags básicos
  const metaTags = [
    // Meta tags esenciales
    { name: 'description', content: finalDescription },
    { name: 'keywords', content: finalKeywords.join(', ') },
    { name: 'author', content: author || 'EventConnect Team' },
    {
      name: 'robots',
      content: `${noIndex ? 'noindex' : 'index'},${noFollow ? 'nofollow' : 'follow'}`,
    },
    { name: 'language', content: 'es' },
    { name: 'revisit-after', content: '7 days' },
    { name: 'rating', content: 'General' },
    { name: 'distribution', content: 'Global' },
    { name: 'coverage', content: 'Worldwide' },
    { name: 'target', content: 'all' },
    { name: 'HandheldFriendly', content: 'true' },
    { name: 'MobileOptimized', content: '320' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'EventConnect' },
    { name: 'application-name', content: 'EventConnect' },
    { name: 'msapplication-TileColor', content: '#3b82f6' },
    { name: 'msapplication-config', content: '/browserconfig.xml' },
    { name: 'theme-color', content: '#3b82f6' },
    { name: 'color-scheme', content: 'light dark' },
    { name: 'supported-color-schemes', content: 'light dark' },

    // Open Graph (Facebook)
    { property: 'og:title', content: finalTitle },
    { property: 'og:description', content: finalDescription },
    { property: 'og:type', content: type },
    { property: 'og:url', content: finalUrl },
    { property: 'og:image', content: finalImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: finalTitle },
    { property: 'og:site_name', content: 'EventConnect' },
    { property: 'og:locale', content: 'es_ES' },
    { property: 'og:locale:alternate', content: 'en_US' },
    { property: 'og:locale:alternate', content: 'fr_FR' },
    { property: 'og:locale:alternate', content: 'pt_BR' },

    // Twitter Card
    { name: 'twitter:card', content: twitterCard },
    { name: 'twitter:site', content: '@EventConnect' },
    { name: 'twitter:creator', content: '@EventConnect' },
    { name: 'twitter:title', content: finalTitle },
    { name: 'twitter:description', content: finalDescription },
    { name: 'twitter:image', content: finalImage },
    { name: 'twitter:image:alt', content: finalTitle },

    // Meta tags específicos para eventos
    ...(type === 'event'
      ? [
          { property: 'og:type', content: 'event' },
          { property: 'event:start_time', content: publishedTime },
          { property: 'event:end_time', content: modifiedTime },
          { property: 'event:location', content: 'Ubicación del evento' },
          { property: 'event:category', content: section },
        ]
      : []),

    // Meta tags específicos para artículos
    ...(type === 'article'
      ? [
          { property: 'article:published_time', content: publishedTime },
          { property: 'article:modified_time', content: modifiedTime },
          { property: 'article:author', content: author },
          { property: 'article:section', content: section },
          ...tags.map(tag => ({ property: 'article:tag', content: tag })),
        ]
      : []),

    // Meta tags para PWA
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'EventConnect' },
    { name: 'application-name', content: 'EventConnect' },
    { name: 'msapplication-TileColor', content: '#3b82f6' },
    { name: 'msapplication-TileImage', content: '/images/icon-144.png' },

    // Meta tags de seguridad
    { name: 'referrer', content: 'strict-origin-when-cross-origin' },
    { name: 'X-UA-Compatible', content: 'IE=edge' },
    {
      name: 'viewport',
      content:
        'width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover',
    },

    // Meta tags de rendimiento
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'format-detection', content: 'date=no' },
    { name: 'format-detection', content: 'address=no' },
    { name: 'format-detection', content: 'email=no' },
  ];

  // Structured Data (JSON-LD)
  const generateStructuredData = () => {
    if (structuredData) {
      return structuredData;
    }

    // Structured data por defecto para la organización
    const defaultStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'EventConnect',
      url: baseUrl,
      logo: `${baseUrl}/images/logo.png`,
      description: finalDescription,
      sameAs: [
        'https://facebook.com/eventconnect',
        'https://twitter.com/eventconnect',
        'https://instagram.com/eventconnect',
        'https://linkedin.com/company/eventconnect',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-0123',
        contactType: 'customer service',
        email: 'support@eventconnect.com',
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ES',
        addressLocality: 'Madrid',
        addressRegion: 'Madrid',
      },
      founder: {
        '@type': 'Person',
        name: 'EventConnect Team',
      },
      foundingDate: '2024',
      numberOfEmployees: '10-50',
      industry: 'Technology',
      knowsAbout: finalKeywords,
    };

    return defaultStructuredData;
  };

  // Generar sitemap dinámico
  const generateSitemap = () => {
    const sitemap = [
      { url: '/', changefreq: 'daily', priority: '1.0' },
      { url: '/events', changefreq: 'hourly', priority: '0.9' },
      { url: '/tribes', changefreq: 'daily', priority: '0.8' },
      { url: '/map', changefreq: 'daily', priority: '0.8' },
      { url: '/about', changefreq: 'monthly', priority: '0.6' },
      { url: '/contact', changefreq: 'monthly', priority: '0.5' },
      { url: '/privacy', changefreq: 'yearly', priority: '0.3' },
      { url: '/terms', changefreq: 'yearly', priority: '0.3' },
    ];

    return sitemap;
  };

  // Generar breadcrumbs structured data
  const generateBreadcrumbsData = () => {
    const pathSegments = router.asPath.split('/').filter(segment => segment);
    const breadcrumbs = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: baseUrl,
      },
    ];

    let currentUrl = baseUrl;
    pathSegments.forEach((segment, index) => {
      currentUrl += `/${segment}`;
      breadcrumbs.push({
        '@type': 'ListItem',
        position: index + 2,
        name:
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        item: currentUrl,
      });
    });

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs,
    };
  };

  // Generar FAQ structured data
  const generateFAQData = () => {
    const faqs = [
      {
        '@type': 'Question',
        name: '¿Qué es EventConnect?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'EventConnect es una plataforma que te permite descubrir eventos increíbles y conectar con tribus cerca de ti.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo puedo crear un evento?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Puedes crear eventos fácilmente desde tu perfil o desde la página principal usando el botón "Crear Evento".',
        },
      },
      {
        '@type': 'Question',
        name: '¿Es gratis usar EventConnect?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'EventConnect es completamente gratuito para usuarios básicos. Ofrecemos funcionalidades premium para organizadores.',
        },
      },
    ];

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs,
    };
  };

  // Generar Local Business structured data
  const generateLocalBusinessData = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'EventConnect',
      description: finalDescription,
      url: baseUrl,
      telephone: '+1-555-0123',
      email: 'info@eventconnect.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Calle Principal 123',
        addressLocality: 'Madrid',
        addressRegion: 'Madrid',
        postalCode: '28001',
        addressCountry: 'ES',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '40.4168',
        longitude: '-3.7038',
      },
      openingHours: 'Mo-Su 00:00-23:59',
      priceRange: '$$',
      servesCuisine: 'Eventos y Comunidades',
      hasMap: `${baseUrl}/map`,
      areaServed: 'Worldwide',
    };
  };

  // Generar WebSite structured data
  const generateWebSiteData = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'EventConnect',
      url: baseUrl,
      description: finalDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@type': 'Organization',
        name: 'EventConnect',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/images/logo.png`,
        },
      },
    };
  };

  return (
    <Head>
      {/* Meta tags básicos */}
      <title>{finalTitle}</title>
      <meta charSet='utf-8' />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover'
      />

      {/* Meta tags dinámicos */}
      {metaTags.map((tag, index) => (
        <meta key={index} {...tag} />
      ))}

      {/* Canonical URL */}
      <link rel='canonical' href={finalCanonical} />

      {/* Preconnect para performance */}
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link
        rel='preconnect'
        href='https://fonts.gstatic.com'
        crossOrigin='anonymous'
      />
      <link rel='preconnect' href='https://maps.googleapis.com' />
      <link rel='preconnect' href='https://maps.gstatic.com' />

      {/* DNS prefetch */}
      <link rel='dns-prefetch' href='//www.google-analytics.com' />
      <link rel='dns-prefetch' href='//www.googletagmanager.com' />
      <link rel='dns-prefetch' href='//www.google.com' />

      {/* Favicon y iconos */}
      <link rel='icon' href='/favicon.ico' />
      <link
        rel='icon'
        type='image/png'
        sizes='32x32'
        href='/images/icon-32.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='16x16'
        href='/images/icon-16.png'
      />
      <link
        rel='apple-touch-icon'
        sizes='180x180'
        href='/images/icon-180.png'
      />
      <link
        rel='mask-icon'
        href='/images/safari-pinned-tab.svg'
        color='#3b82f6'
      />

      {/* Manifest PWA */}
      <link rel='manifest' href='/manifest.json' />

      {/* Open Graph adicionales */}
      {publishedTime && (
        <meta property='article:published_time' content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property='article:modified_time' content={modifiedTime} />
      )}
      {author && <meta property='article:author' content={author} />}
      {section && <meta property='article:section' content={section} />}
      {tags.map((tag, index) => (
        <meta key={index} property='article:tag' content={tag} />
      ))}

      {/* Twitter adicionales */}
      <meta name='twitter:site' content='@EventConnect' />
      <meta name='twitter:creator' content='@EventConnect' />

      {/* Structured Data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData()),
        }}
      />

      {/* Breadcrumbs Structured Data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbsData()),
        }}
      />

      {/* FAQ Structured Data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQData()),
        }}
      />

      {/* Local Business Structured Data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLocalBusinessData()),
        }}
      />

      {/* WebSite Structured Data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateWebSiteData()),
        }}
      />

      {/* Sitemap */}
      <link
        rel='sitemap'
        type='application/xml'
        title='Sitemap'
        href='/sitemap.xml'
      />

      {/* RSS Feed */}
      <link
        rel='alternate'
        type='application/rss+xml'
        title='EventConnect RSS Feed'
        href='/feed.xml'
      />

      {/* Hreflang para internacionalización */}
      <link rel='alternate' hrefLang='es' href={finalUrl} />
      <link
        rel='alternate'
        hrefLang='en'
        href={finalUrl.replace('/es/', '/en/')}
      />
      <link rel='alternate' hrefLang='x-default' href={finalUrl} />

      {/* Meta tags de seguridad adicionales */}
      <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
      <meta name='referrer' content='strict-origin-when-cross-origin' />

      {/* Meta tags de rendimiento */}
      <meta name='format-detection' content='telephone=no' />
      <meta name='format-detection' content='date=no' />
      <meta name='format-detection' content='address=no' />
      <meta name='format-detection' content='email=no' />

      {/* Meta tags específicos para móviles */}
      <meta name='HandheldFriendly' content='true' />
      <meta name='MobileOptimized' content='320' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='default' />
      <meta name='apple-mobile-web-app-title' content='EventConnect' />
      <meta name='application-name' content='EventConnect' />

      {/* Meta tags de PWA */}
      <meta name='mobile-web-app-capable' content='yes' />
      <meta name='msapplication-TileColor' content='#3b82f6' />
      <meta name='msapplication-TileImage' content='/images/icon-144.png' />
      <meta name='msapplication-config' content='/browserconfig.xml' />
      <meta name='theme-color' content='#3b82f6' />
      <meta name='color-scheme' content='light dark' />
      <meta name='supported-color-schemes' content='light dark' />
    </Head>
  );
};

export default SEOHead;
