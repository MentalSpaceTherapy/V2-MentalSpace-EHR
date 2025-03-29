import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { checkForUpdates } from '@/lib/pwa-utils';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

export function UpdateNotification() {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  useEffect(() => {
    // Register a callback for when updates are found
    checkForUpdates(() => {
      setShowUpdateDialog(true);
    });
  }, []);

  // Handle update action
  const handleUpdate = () => {
    // Reload the page to activate the new service worker
    window.location.reload();
  };

  // Handle dismiss
  const handleDismiss = () => {
    setShowUpdateDialog(false);
  };

  return (
    <AlertDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary animate-spin" />
            Update Available
          </AlertDialogTitle>
          <AlertDialogDescription>
            A new version of MentalSpace EHR is available. 
            Reload the page to update to the latest version for improvements and new features.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDismiss}>Later</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpdate}>
            Update Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}