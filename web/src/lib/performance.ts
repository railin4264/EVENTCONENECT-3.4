// Performance optimization utilities

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window !== 'undefined') {
    // Preload critical fonts
    const fontLinks = [
      '/fonts/inter-var.woff2',
      // Add other critical fonts here
    ];

    fontLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = href;
      document.head.appendChild(link);
    });
  }
};

// Optimize bundle loading
export const optimizeBundle = () => {
  if (typeof window !== 'undefined') {
    // Prefetch next page resources
    const prefetchLinks = [
      '/events',
      '/auth/login',
    ];

    prefetchLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }
};

// Lazy load non-critical CSS
export const lazyLoadCSS = (href: string, media: string = 'all') => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = media;
    };
    document.head.appendChild(link);
  }
};

// Performance monitoring
export const measurePerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      // Measure LCP
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }

      // Measure other metrics
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          console.log('Performance Metrics:', {
            'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
            'TCP Connection': perfData.connectEnd - perfData.connectStart,
            'Request/Response': perfData.responseEnd - perfData.requestStart,
            'DOM Processing': perfData.domComplete - perfData.domLoading,
            'Total Load Time': perfData.loadEventEnd - perfData.loadEventStart,
          });
        }
      }, 100);
    });
  }
};

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  preloadCriticalResources();
  optimizeBundle();
  measurePerformance();
};
