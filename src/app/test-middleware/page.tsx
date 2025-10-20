'use client';
import React, { useEffect, useState } from 'react';

export default function TestMiddlewarePage() {
  const [cookies, setCookies] = useState<string>('');

  useEffect(() => {
    // Get all cookies
    const allCookies = document.cookie;
    setCookies(allCookies);
    
    console.log('🍪 All cookies:', allCookies);
    console.log('🍪 Parsed cookies:', document.cookie.split(';').map(c => c.trim()));
    
    // Check specific cookies
    const accessToken = document.cookie.split(';').find(c => c.trim().startsWith('accessToken='));
    const userRole = document.cookie.split(';').find(c => c.trim().startsWith('userRole='));
    
    console.log('🔍 AccessToken cookie:', accessToken);
    console.log('🔍 UserRole cookie:', userRole);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Middleware Test Page
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Cookie Information</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm">{cookies || 'No cookies found'}</pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Links</h2>
          <div className="space-y-2">
            <a 
              href="/become-tutor" 
              className="block p-3 bg-blue-100 hover:bg-blue-200 rounded text-blue-800"
            >
              Test /become-tutor (should redirect if not authenticated)
            </a>
            <a 
              href="/admin/dashboard" 
              className="block p-3 bg-red-100 hover:bg-red-200 rounded text-red-800"
            >
              Test /admin/dashboard (should redirect if not system admin)
            </a>
            <a 
              href="/find-tutor" 
              className="block p-3 bg-green-100 hover:bg-green-200 rounded text-green-800"
            >
              Test /find-tutor (should work for everyone)
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Open browser console to see middleware logs</li>
            <li>Click on the test links above</li>
            <li>Check if middleware is running and what cookies are available</li>
            <li>Verify redirect behavior</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
