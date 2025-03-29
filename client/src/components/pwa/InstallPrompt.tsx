import React, { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { 
  isMobileDevice, 
  isRunningAsPwa, 
  setupInstallPrompt 
} from '@/lib/pwa-utils';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function InstallPrompt() {
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { toast } = useToast();
  const isMobile = isMobileDevice();
  
  useEffect(() => {
    // Check if we should show the banner
    const hasUserDismissedBefore = localStorage.getItem('pwa-install-dismissed');
    const alreadyInstalled = isRunningAsPwa();

    // Only show if not already installed, not dismissed before
    if (!alreadyInstalled && !hasUserDismissedBefore) {
      // Wait a few seconds before showing the banner
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  // Set up the install prompt
  const { showInstallPrompt, isPromptAvailable } = setupInstallPrompt();

  // Handle install click
  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    
    if (installed) {
      toast({
        title: "App installed successfully!",
        description: "Thank you for installing our app.",
      });
      setShowBanner(false);
    } else {
      toast({
        title: "Installation cancelled",
        description: "You can install the app later from the browser menu.",
        variant: "default",
      });
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setBannerDismissed(true);
    setShowBanner(false);
  };

  // If banner was dismissed or shouldn't be shown, don't render
  if (!showBanner || bannerDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Install MentalSpace</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
          <CardDescription>
            {isMobile 
              ? "Install this app on your home screen for a better experience" 
              : "Install our app for quick access even when offline"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1">
              <li>Fast access to clients and sessions</li>
              <li>Offline access to key information</li>
              <li>Improved performance</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleInstall}
            disabled={!isPromptAvailable()}
          >
            <Download className="mr-2 h-4 w-4" />
            Install App
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}