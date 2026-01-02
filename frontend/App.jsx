import React, { useState } from 'react';
import BatchImportMonitor from './components/BatchImportMonitor';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('jwt-token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  // Mock login function
  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'password123'
        })
      });

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('jwt-token', data.token);
        setToken(data.token);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('jwt-token');
    setToken('');
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                🏨 EliteHub Inventory System
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-gray-600">Welcome, Admin</span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {isLoggedIn ? (
            <div className="space-y-6">
              {/* Page Title */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Inventory Management
                </h2>
                <p className="text-gray-600">
                  Upload and monitor bulk inventory imports in real-time using Socket.io
                </p>
              </div>

              {/* Batch Import Monitor */}
              <BatchImportMonitor 
                token={token}
                onImportComplete={(results) => {
                  console.log('Import completed:', results);
                }}
              />

              {/* Additional Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">
                  📊 How to Use
                </h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start">
                    <span className="font-medium mr-2">1.</span>
                    <span>Select a CSV or JSON file containing inventory items</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">2.</span>
                    <span>Click "Start Upload & Monitor" to begin the import process</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">3.</span>
                    <span>Monitor real-time progress through the Socket.io connection</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">4.</span>
                    <span>View detailed results including successes, errors, and warnings</span>
                  </div>
                </div>
              </div>

              {/* Sample Data Format */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  📋 Sample Data Format
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">CSV Format:</h4>
                    <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
{`name,category,sku,description,unit,minLevel,maxLevel,reorderLevel,costPrice,sellingPrice,supplier,location
Premium Towels,Linens,TOW-001,High-quality cotton towels,pieces,10,100,20,15.50,25.00,Luxury Linens,Storage A
Bath Soaps,Toiletries,SOAP-001,Premium bath soap,pieces,50,200,75,2.50,5.00,Hygiene Ltd,Storage B`}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">JSON Format:</h4>
                    <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
{`[
  {
    "name": "Premium Towels",
    "category": "Linens",
    "sku": "TOW-001",
    "description": "High-quality cotton towels",
    "unit": "pieces",
    "minLevel": 10,
    "maxLevel": 100,
    "reorderLevel": 20,
    "costPrice": 15.50,
    "sellingPrice": 25.00,
    "supplier": "Luxury Linens",
    "location": "Storage A"
  }
]`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please login to access the inventory import monitoring system.
              </p>
              <button
                onClick={handleLogin}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login to Continue
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            © 2024 EliteHub Hotel Management System. Real-time Socket.io monitoring powered by React & Tailwind CSS.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
