import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Component that monitors network status and displays alerts
 * Shows a persistent banner when offline and a brief banner when reconnected
 */
export function NetworkStatus() {
  const { isOnline, wasOffline } = useNetworkStatus();

  // Show persistent banner when offline
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top">
        <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>No Internet Connection</AlertTitle>
          <AlertDescription>
            You are currently offline. Please reconnect to save your changes.
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
            You are back online. You can now save changes.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
