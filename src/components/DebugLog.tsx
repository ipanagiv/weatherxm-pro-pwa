import React, { useState, useEffect } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  params?: Record<string, any>;
}

export const DebugLog: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to add a log entry
  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 50)); // Keep only the last 50 logs
  };

  // Expose the addLog function to the window object for global access
  useEffect(() => {
    (window as any).addDebugLog = addLog;
    
    return () => {
      delete (window as any).addDebugLog;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const formatDuration = (ms: number) => {
    return `${ms.toFixed(2)}ms`;
  };

  const formatParams = (params: Record<string, any>) => {
    return Object.entries(params)
      .map(([key, value]) => {
        // Mask API key if present
        if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token')) {
          return `${key}: ****`;
        }
        return `${key}: ${value}`;
      })
      .join(', ');
  };

  return (
    <div className="border rounded shadow-md bg-gray-200 dark:bg-gray-700">
      <div 
        className="p-3 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-semibold">Debug Log</h2>
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearLogs();
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Clear
          </button>
          <span>{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 max-h-60 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No logs yet. API calls will be logged here.
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className="p-2 bg-white dark:bg-gray-800 rounded text-sm"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{log.method}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="truncate text-blue-600 dark:text-blue-400">
                    {log.url}
                  </div>
                  {log.params && (
                    <div className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                      {formatParams(log.params)}
                    </div>
                  )}
                  <div className="flex justify-between mt-1 text-xs">
                    {log.status && (
                      <span className={`${
                        log.status >= 200 && log.status < 300 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        Status: {log.status}
                      </span>
                    )}
                    {log.duration && (
                      <span className="text-gray-500 dark:text-gray-400">
                        Duration: {formatDuration(log.duration)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 