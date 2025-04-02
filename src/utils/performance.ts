/**
 * Performance monitoring utilities for the MentalSpace EHR application
 * Tracks and reports performance metrics for monitoring and optimization
 */

// List of Web Vitals metrics we want to track
export type Metric = {
  id: string;
  name: string;
  value: number;
  delta: number;
  entries: PerformanceEntry[];
};

// Options for performance monitoring
export type PerformanceOptions = {
  reportTo?: string; // URL to report metrics to
  debug?: boolean; // Whether to log metrics to console
  sampleRate?: number; // Percentage of users to monitor (0-1)
};

/**
 * Initialize performance monitoring
 * @param options Configuration options
 */
export function initPerformanceMonitoring(options: PerformanceOptions = {}) {
  const {
    reportTo,
    debug = false,
    sampleRate = 1.0, // Default to tracking all users
  } = options;

  // Only monitor a percentage of users based on sample rate
  const shouldMonitor = Math.random() <= sampleRate;
  if (!shouldMonitor) return;

  // Create a buffer for metrics before sending
  const metricsBuffer: Metric[] = [];

  // Load the web-vitals library dynamically to avoid bundling it for all users
  import('web-vitals').then((webVitals) => {
    const { onCLS, onFID, onLCP, onTTFB, onFCP } = webVitals;

    // Track Core Web Vitals and other metrics
    onCLS(handleMetric);
    onFID(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onFCP(handleMetric);
  });

  // Track page navigations for Single Page App
  let navigationStart = performance.now();
  
  // Listen for route changes in the SPA
  window.addEventListener('popstate', () => {
    trackPageNavigation();
    navigationStart = performance.now();
  });

  // Track clicks on links to measure navigation start
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' || target.closest('a')) {
      navigationStart = performance.now();
    }
  });

  // Handle and process a performance metric
  function handleMetric(metric: Metric) {
    if (debug) {
      console.log(`[Performance] ${metric.name}: ${metric.value}`);
    }

    // Add to buffer
    metricsBuffer.push(metric);

    // Send metrics if buffer is large enough or on certain events
    if (metricsBuffer.length >= 5) {
      sendMetrics();
    }
  }

  // Track page navigation performance in SPA
  function trackPageNavigation() {
    const navigationTime = performance.now() - navigationStart;
    
    const navigationMetric: Metric = {
      id: 'PAGE_NAVIGATION',
      name: 'Page Navigation',
      value: navigationTime,
      delta: navigationTime,
      entries: [],
    };
    
    handleMetric(navigationMetric);
  }

  // Track component render timing
  function trackRender(componentName: string, renderTime: number) {
    const renderMetric: Metric = {
      id: `COMPONENT_RENDER_${componentName}`,
      name: `Component Render: ${componentName}`,
      value: renderTime,
      delta: renderTime,
      entries: [],
    };
    
    handleMetric(renderMetric);
  }

  // Track API request performance
  function trackApiRequest(endpoint: string, duration: number, success: boolean) {
    const apiMetric: Metric = {
      id: `API_REQUEST_${endpoint}`,
      name: `API Request: ${endpoint}`,
      value: duration,
      delta: duration,
      entries: [],
    };
    
    handleMetric(apiMetric);
  }

  // Send metrics to server
  function sendMetrics() {
    if (!metricsBuffer.length) return;
    
    // If reportTo URL is provided, send metrics to server
    if (reportTo) {
      const payload = {
        metrics: metricsBuffer,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        // Add any other context information
        connection: (navigator as any).connection 
          ? {
              effectiveType: (navigator as any).connection.effectiveType,
              rtt: (navigator as any).connection.rtt,
            }
          : undefined,
      };

      // Use a beacon if possible, or fall back to fetch
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          reportTo, 
          new Blob([JSON.stringify(payload)], { type: 'application/json' })
        );
      } else {
        // Use fetch with keepalive to ensure the request completes
        fetch(reportTo, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        }).catch(err => {
          if (debug) console.error('[Performance] Error sending metrics:', err);
        });
      }
    }
    
    // Clear the buffer
    metricsBuffer.length = 0;
  }

  // Send remaining metrics on page unload
  window.addEventListener('unload', sendMetrics);

  // Export functions for manual tracking
  return {
    trackRender,
    trackApiRequest,
    trackPageNavigation,
  };
}

/**
 * React hook for measuring component render performance
 * @param componentName Name of the component to track
 */
export function useComponentPerformance(componentName: string) {
  // Use this in development mode only
  if (process.env.NODE_ENV !== 'development') {
    return { measureRender: (fn: Function) => fn() };
  }

  const startTime = performance.now();
  
  // Function to measure render time
  const measureRender = (renderFn: Function) => {
    const result = renderFn();
    const renderTime = performance.now() - startTime;
    console.log(`[Render Performance] ${componentName}: ${renderTime.toFixed(2)}ms`);
    return result;
  };

  return { measureRender };
}

/**
 * Create a performance monitor for React components using HOC
 * @param Component The component to monitor
 * @param options Monitoring options
 */
export function withPerformanceMonitoring(
  Component: React.ComponentType<any>,
  options: { name?: string; trackProps?: boolean } = {}
) {
  const componentName = options.name || Component.displayName || Component.name || 'Unknown';
  
  // Return a wrapped component with performance monitoring
  return function PerformanceMonitoredComponent(props: any) {
    const startTime = performance.now();
    
    // Only track in non-production builds to avoid overhead
    if (process.env.NODE_ENV !== 'production') {
      console.time(`[Render] ${componentName}`);
      
      if (options.trackProps) {
        console.log(`[Props] ${componentName}:`, props);
      }
    }
    
    // Render the component
    const result = Component(props);
    
    if (process.env.NODE_ENV !== 'production') {
      console.timeEnd(`[Render] ${componentName}`);
      const renderTime = performance.now() - startTime;
      console.log(`[Render Time] ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
    
    return result;
  };
} 