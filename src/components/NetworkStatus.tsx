import { useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Component that monitors network status and displays alerts
 * Shows a persistent banner when offline and a success toast when reconnected
 */
export function NetworkStatus() {
  const { isOnline, wasOffline } = useNetworkStatus();

  useEffect(() => {
    if (!isOnline) {
      // User just went offline
      toast({
        title: 'No Internet Connection',
        description: 'You are currently offline. Changes will be saved when you reconnect.',
        variant: 'destructive',
        duration: Infinity, // Keep toast visible while offline
      });
    } else if (wasOffline) {
      // User just came back online
      toast({
        title: 'Back Online',
        description: 'Your connection has been restored. Retrying any failed operations...',
        duration: 3000,
      });
    }
  }, [isOnline, wasOffline]);

  // Show persistent banner when offline
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top">
        <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>No Internet Connection</AlertTitle>
          <AlertDescription>
            You are currently offline. Changes will be saved automatically when your connection is restored.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show brief "back online" banner
  if (wasOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top">
        <Alert className="rounded-none border-x-0 border-t-0 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          <Wifi className="h-4 w-4" />
          <AlertTitle>Connection Restored</AlertTitle>
          <AlertDescription>
            You are back online. Syncing your changes...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
