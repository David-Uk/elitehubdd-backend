import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const BatchImportMonitor = ({ token, onImportComplete }) => {
  // Socket and connection state
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // Import session state
  const [currentSession, setCurrentSession] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // Progress state
  const [progress, setProgress] = useState({
    status: 'idle',
    currentPhase: '',
    progress: 0,
    processedCount: 0,
    successCount: 0,
    errorCount: 0,
    skipCount: 0,
    itemCount: 0,
    estimatedTimeRemaining: null,
    errors: [],
    warnings: [],
    results: null
  });
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.io');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Import monitoring event handlers
    newSocket.on('import_progress', (data) => {
      console.log('📊 Progress update:', data);
      setProgress(prev => ({
        ...prev,
        ...data,
        errors: data.errors || [],
        warnings: data.warnings || []
      }));
    });

    newSocket.on('import_session_joined', (data) => {
      console.log('🎯 Joined session:', data.sessionId);
      setIsMonitoring(true);
    });

    newSocket.on('import_session_left', (data) => {
      console.log('👋 Left session:', data.sessionId);
      setIsMonitoring(false);
      setCurrentSession(null);
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      setConnectionError(error.message);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token]);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  // Parse uploaded file
  const parseFile = async (file) => {
    const text = await file.text();
    
    if (file.name.endsWith('.json')) {
      return JSON.parse(text);
    } else if (file.name.endsWith('.csv')) {
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      return lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim());
          const item = {};
          
          headers.forEach((header, index) => {
            item[header] = values[index];
          });
          
          return item;
        });
    }
    
    throw new Error('Unsupported file format. Please use CSV or JSON.');
  };

  // Start batch upload with monitoring
  const startUpload = async () => {
    if (!selectedFile || !socket || !isConnected) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Parse file
      const items = await parseFile(selectedFile);
      setUploadProgress(25);
      
      // Start batch upload
      const response = await fetch('/api/inventory/items/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });
      
      setUploadProgress(75);
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      setUploadProgress(100);
      
      // Start monitoring
      if (result.meta?.sessionId) {
        setCurrentSession(result.meta.sessionId);
        socket.emit('join_import_session', result.meta.sessionId);
      }
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      setConnectionError(error.message);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  // Stop monitoring
  const stopMonitoring = () => {
    if (socket && currentSession) {
      socket.emit('leave_import_session', currentSession);
    }
  };

  // Reset progress
  const resetProgress = () => {
    setProgress({
      status: 'idle',
      currentPhase: '',
      progress: 0,
      processedCount: 0,
      successCount: 0,
      errorCount: 0,
      skipCount: 0,
      itemCount: 0,
      estimatedTimeRemaining: null,
      errors: [],
      warnings: [],
      results: null
    });
    setSelectedFile(null);
    setCurrentSession(null);
    setConnectionError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format time remaining
  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds) return '--';
    
    const seconds = Math.round(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  // Get phase color
  const getPhaseColor = (phase) => {
    const colors = {
      'validation': 'text-blue-600',
      'duplicate_check': 'text-yellow-600',
      'creation': 'text-green-600',
      'completed': 'text-emerald-600'
    };
    return colors[phase] || 'text-gray-600';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      'idle': 'bg-gray-100 text-gray-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'error': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📦 Batch Inventory Import Monitor
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {currentSession && (
            <div className="text-sm text-gray-600">
              Session: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {currentSession.substring(0, 20)}...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Connection Error */}
      {connectionError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800">{connectionError}</span>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      {!isMonitoring && (
        <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Select File
            </label>
            
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-medium">{selectedFile.name}</span>
                </p>
                
                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={startUpload}
                  disabled={isUploading || !isConnected}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    'Start Upload & Monitor'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Monitoring Section */}
      {isMonitoring && (
        <div className="space-y-6">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(progress.status)}`}>
                {progress.status}
              </span>
              <span className={`text-sm font-medium ${getPhaseColor(progress.currentPhase)}`}>
                {progress.currentPhase?.replace('_', ' ').toUpperCase() || 'INITIALIZING'}
              </span>
            </div>
            
            <button
              onClick={stopMonitoring}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Stop Monitoring
            </button>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{progress.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{progress.processedCount}</div>
              <div className="text-sm text-blue-800">Processed</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{progress.successCount}</div>
              <div className="text-sm text-green-800">Created</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{progress.skipCount}</div>
              <div className="text-sm text-yellow-800">Skipped</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{progress.errorCount}</div>
              <div className="text-sm text-red-800">Errors</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Items</div>
              <div className="text-lg font-semibold text-gray-900">{progress.itemCount}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Time Remaining</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatTimeRemaining(progress.estimatedTimeRemaining)}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Session ID</div>
              <div className="text-xs font-mono text-gray-900 truncate">
                {currentSession || 'N/A'}
              </div>
            </div>
          </div>

          {/* Errors and Warnings */}
          {(progress.errors.length > 0 || progress.warnings.length > 0) && (
            <div className="space-y-4">
              {progress.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">
                    Errors ({progress.errors.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {progress.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        <span className="font-medium">Row {error.index + 1}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {progress.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    Warnings ({progress.warnings.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {progress.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-yellow-700">
                        <span className="font-medium">Row {warning.index + 1}:</span> {warning.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completion Message */}
          {progress.status === 'completed' && progress.results && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <svg className="w-8 h-8 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-lg font-medium text-green-800">Import Completed Successfully!</h4>
                  <div className="mt-2 text-sm text-green-700">
                    <div>Total items: {progress.results.summary?.total || 0}</div>
                    <div>Created: {progress.results.summary?.created || 0}</div>
                    <div>Skipped: {progress.results.summary?.skipped || 0}</div>
                    <div>Errors: {progress.results.summary?.errors || 0}</div>
                    <div>Total time: {Math.round((progress.totalTime || 0) / 1000)}s</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={resetProgress}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Start New Import
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchImportMonitor;
