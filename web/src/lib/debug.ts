// Debug utilities for EventConnect

export const debugApp = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🚀 EventConnect Debug Mode Activated');
    
    // Monitor clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        console.log('🖱️ Button clicked:', target);
      }
    });

    // Monitor navigation
    if ('navigation' in performance) {
      const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('📊 Performance:', entry);
        }
      });
      perfObserver.observe({ entryTypes: ['navigation', 'measure'] });
    }

    // Monitor errors
    window.addEventListener('error', (e) => {
      console.error('❌ JavaScript Error:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('❌ Unhandled Promise Rejection:', e.reason);
    });

    // Test button functionality
    console.log('🧪 Testing button functionality...');
    setTimeout(() => {
      const buttons = document.querySelectorAll('button');
      console.log(`✅ Found ${buttons.length} buttons on page`);
      buttons.forEach((btn, index) => {
        if (btn.onclick || btn.getAttribute('onclick')) {
          console.log(`✅ Button ${index + 1} has click handler`);
        } else {
          console.log(`⚠️ Button ${index + 1} missing click handler:`, btn.textContent);
        }
      });
    }, 1000);
  }
};

export const testNavigation = () => {
  if (typeof window !== 'undefined') {
    console.log('🧭 Testing navigation...');
    console.log('Current URL:', window.location.href);
    console.log('History length:', window.history.length);
  }
};

export const logComponentMount = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Component mounted: ${componentName}`);
  }
};

export const logUserAction = (action: string, details?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`👤 User action: ${action}`, details);
  }
};
