// PWA related utilities

/**
 * Checks if the app is being used in standalone mode (installed as PWA)
 */
export function isRunningAsPwa(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}

/**
 * Checks if the device is capable of installing a PWA
 */
export function isPwaInstallable(): boolean {
  return 'serviceWorker' in navigator && 
         'BeforeInstallPromptEvent' in window;
}

/**
 * Checks if the app is running on a mobile device
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Creates a hook to listen for the beforeinstallprompt event
 * and provide a method to show the install prompt
 */
export function setupInstallPrompt() {
  // Initialize deferredPrompt for use later
  let deferredPrompt: any = null;

  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
  });

  // Function to show the install prompt
  const showInstallPrompt = async () => {
    if (!deferredPrompt) {
      return false;
    }

    // Show the prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, discard it
    deferredPrompt = null;
    
    return outcome === 'accepted';
  };

  return {
    showInstallPrompt,
    isPromptAvailable: () => !!deferredPrompt
  };
}

/**
 * Registers the service worker
 */
export async function registerServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful:', registration);
      return true;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
      return false;
    }
  }
  return false;
}

/**
 * Check if there's a newer version of the service worker available
 * and show an update notification if needed
 */
export function checkForUpdates(onUpdateFound: () => void): void {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    registration.addEventListener('updatefound', () => {
      // A new service worker is being installed
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        // New service worker is installed and waiting
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version is available
          onUpdateFound();
        }
      });
    });
  });
}