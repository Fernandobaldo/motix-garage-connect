
// Analytics utility for tracking user interactions and conversions
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// Google Analytics tracking
export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }
  
  // Console log for development
  console.log('Analytics Event:', event);
};

// Specific conversion tracking functions
export const trackConversion = {
  // Free trial signup
  freeTrialSignup: () => {
    trackEvent({
      action: 'signup',
      category: 'conversion',
      label: 'free_trial',
    });
  },

  // Demo video play
  demoVideoPlay: () => {
    trackEvent({
      action: 'play',
      category: 'engagement',
      label: 'demo_video',
    });
  },

  // Contact form submission
  contactFormSubmit: (formType: string) => {
    trackEvent({
      action: 'submit',
      category: 'lead_generation',
      label: formType,
    });
  },

  // Premium plan interest
  premiumPlanInterest: () => {
    trackEvent({
      action: 'interest',
      category: 'conversion',
      label: 'premium_plan',
    });
  },

  // Navigation clicks
  navigationClick: (section: string) => {
    trackEvent({
      action: 'click',
      category: 'navigation',
      label: section,
    });
  },

  // Page section views (scroll tracking)
  sectionView: (sectionName: string) => {
    trackEvent({
      action: 'view',
      category: 'engagement',
      label: sectionName,
    });
  },

  // Language change
  languageChange: (language: string) => {
    trackEvent({
      action: 'change',
      category: 'localization',
      label: language,
    });
  },

  // Social media clicks
  socialClick: (platform: string) => {
    trackEvent({
      action: 'click',
      category: 'social',
      label: platform,
    });
  },
};

// Page view tracking
export const trackPageView = (pagePath: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: pagePath,
    });
  }
};

// Scroll depth tracking
export const setupScrollTracking = () => {
  if (typeof window === 'undefined') return;

  const scrollThresholds = [25, 50, 75, 90];
  const trackedThresholds = new Set<number>();

  const handleScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    scrollThresholds.forEach(threshold => {
      if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
        trackedThresholds.add(threshold);
        trackEvent({
          action: 'scroll',
          category: 'engagement',
          label: `${threshold}_percent`,
          value: threshold,
        });
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

// Time on page tracking
export const setupTimeTracking = () => {
  if (typeof window === 'undefined') return;

  const startTime = Date.now();
  const timeThresholds = [30, 60, 120, 300]; // seconds
  const trackedTimes = new Set<number>();

  const checkTimeSpent = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    timeThresholds.forEach(threshold => {
      if (timeSpent >= threshold && !trackedTimes.has(threshold)) {
        trackedTimes.add(threshold);
        trackEvent({
          action: 'time_spent',
          category: 'engagement',
          label: `${threshold}_seconds`,
          value: threshold,
        });
      }
    });
  };

  const interval = setInterval(checkTimeSpent, 5000); // Check every 5 seconds
  
  // Cleanup function
  return () => {
    clearInterval(interval);
  };
};

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
