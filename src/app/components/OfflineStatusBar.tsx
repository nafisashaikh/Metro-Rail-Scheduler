import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  Database,
  Trash2
} from 'lucide-react';
import useOfflineMode, { formatCacheAge, getCacheStatus, shouldShowOfflineWarning } from '../utils/useOfflineMode';

interface OfflineStatusBarProps {
  lastUpdated?: Date | null;
  dataTimestamp?: number;
  compact?: boolean;
}

const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({ 
  lastUpdated, 
  dataTimestamp,
  compact = false 
}) => {
  const {
    isOnline,
    isServiceWorkerRegistered,
    lastOnline,
    cacheInfo,
    cacheSize,
    clearCache
  } = useOfflineMode();

  const cacheAge = dataTimestamp ? Date.now() - dataTimestamp : undefined;
  const status = getCacheStatus(isOnline, dataTimestamp);
  const showWarning = shouldShowOfflineWarning(isOnline, !!dataTimestamp, cacheAge);

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'cached':
        return <Download className="h-4 w-4 text-blue-600" />;
      case 'stale':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'offline':
      default:
        return <WifiOff className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'cached':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'stale':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'offline':
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online - Live Data';
      case 'cached':
        return `Cached Data (${dataTimestamp ? formatCacheAge(dataTimestamp) : 'Recent'})`;
      case 'stale':
        return `Stale Data (${dataTimestamp ? formatCacheAge(dataTimestamp) : 'Old'})`;
      case 'offline':
      default:
        return lastOnline ? `Offline since ${formatCacheAge(lastOnline.getTime())}` : 'Offline';
    }
  };

  const handleClearCache = async () => {
    const success = await clearCache();
    if (success) {
      alert('Cache cleared successfully');
    } else {
      alert('Failed to clear cache');
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="hidden sm:inline">{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor().replace('text-', 'bg-').replace('-800', '-100')}`}>
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Connection Status</h3>
              <p className="text-sm text-gray-600">{getStatusText()}</p>
            </div>
          </div>
          
          {lastUpdated && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Last Updated</div>
              <div className="text-xs text-gray-500">
                {lastUpdated.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            </div>
          )}
        </div>

        {/* Warning for stale/offline data */}
        {showWarning && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  {isOnline ? 'Data may be outdated' : 'You\'re offline'}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {isOnline 
                    ? 'Some information might not be current. Try refreshing for latest updates.'
                    : 'Using cached data. Connect to internet for live updates.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cache information */}
        {isServiceWorkerRegistered && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Offline Storage</span>
              </div>
              <div className="flex items-center gap-2">
                {cacheSize > 0 && (
                  <button
                    onClick={handleClearCache}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-300 rounded transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear Cache
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-900">{cacheSize}</div>
                <div className="text-xs text-gray-600">Cached Items</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-900">
                  {isServiceWorkerRegistered ? 'Active' : 'Inactive'}
                </div>
                <div className="text-xs text-gray-600">Service Worker</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-900">
                  {Object.keys(cacheInfo || {}).length}
                </div>
                <div className="text-xs text-gray-600">Cache Stores</div>
              </div>
            </div>

            {/* Detailed cache breakdown */}
            {cacheInfo && Object.keys(cacheInfo).length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-700 mb-2">Cache Details:</div>
                <div className="space-y-1">
                  {Object.entries(cacheInfo).map(([cacheName, count]) => (
                    <div key={cacheName} className="flex justify-between text-xs text-gray-600">
                      <span className="truncate">{cacheName}</span>
                      <span>{count} items</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Offline capabilities info */}
        {!isOnline && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Offline Features Available</p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>• Cached station schedules</li>
                  <li>• Saved route information</li>
                  <li>• Last known service alerts</li>
                  <li>• Journey planning with cached data</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineStatusBar;