"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TokenManager } from '@/lib/tokenManager';
import { AuthService } from '@/services';

export default function TestTokenRefreshPage() {
  const { user, isAuthenticated } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<{
    token: string | null;
    payload: any;
    timeRemaining: number;
    isExpired: boolean;
    shouldRefreshSoon: boolean;
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const token = TokenManager.getCurrentToken();
      if (token) {
        const payload = TokenManager.decodeToken(token);
        const timeRemaining = TokenManager.getTokenTimeRemaining(token);
        const isExpired = TokenManager.isTokenExpired(token);
        const shouldRefreshSoon = TokenManager.shouldRefreshSoon(token);

        setTokenInfo({
          token,
          payload,
          timeRemaining,
          isExpired,
          shouldRefreshSoon,
        });
      }
    }
  }, [isAuthenticated]);

  // Update token info every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const token = TokenManager.getCurrentToken();
      if (token) {
        const payload = TokenManager.decodeToken(token);
        const timeRemaining = TokenManager.getTokenTimeRemaining(token);
        const isExpired = TokenManager.isTokenExpired(token);
        const shouldRefreshSoon = TokenManager.shouldRefreshSoon(token);

        setTokenInfo({
          token,
          payload,
          timeRemaining,
          isExpired,
          shouldRefreshSoon,
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleManualRefresh = async () => {
    try {
      console.log('🔄 Manual token refresh...');
      const response = await AuthService.refreshToken();
      if (response.success) {
        console.log('✅ Manual refresh successful');
        // Update token info
        const token = TokenManager.getCurrentToken();
        if (token) {
          const payload = TokenManager.decodeToken(token);
          const timeRemaining = TokenManager.getTokenTimeRemaining(token);
          const isExpired = TokenManager.isTokenExpired(token);
          const shouldRefreshSoon = TokenManager.shouldRefreshSoon(token);

          setTokenInfo({
            token,
            payload,
            timeRemaining,
            isExpired,
            shouldRefreshSoon,
          });
        }
      }
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
    }
  };

  const handleTestApiCall = async () => {
    try {
      console.log('🧪 Testing API call...');
      const response = await AuthService.getCurrentUser();
      console.log('✅ API call successful:', response);
    } catch (error) {
      console.error('❌ API call failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Token Refresh Test
          </h1>
          <p className="text-gray-600">
            Please login to test token refresh functionality.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🔄 Token Refresh Test Dashboard
          </h1>

          {/* User Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              👤 User Information
            </h2>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Role:</strong> {user?.role}</p>
          </div>

          {/* Token Info */}
          {tokenInfo && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                🔑 Token Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Time Remaining:</strong> {Math.floor(tokenInfo.timeRemaining / 60)} minutes {tokenInfo.timeRemaining % 60} seconds</p>
                  <p><strong>Is Expired:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${tokenInfo.isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {tokenInfo.isExpired ? 'Yes' : 'No'}
                    </span>
                  </p>
                  <p><strong>Should Refresh Soon:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${tokenInfo.shouldRefreshSoon ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {tokenInfo.shouldRefreshSoon ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>
                <div>
                  <p><strong>Issued At:</strong> {new Date(tokenInfo.payload?.iat * 1000).toLocaleString()}</p>
                  <p><strong>Expires At:</strong> {new Date(tokenInfo.payload?.exp * 1000).toLocaleString()}</p>
                  <p><strong>Issuer:</strong> {tokenInfo.payload?.iss}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">
              🧪 Test Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleManualRefresh}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                🔄 Manual Refresh Token
              </button>
              <button
                onClick={handleTestApiCall}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                🧪 Test API Call
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              📋 How to Test
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Watch the "Time Remaining" countdown</li>
              <li>When it reaches 5 minutes or less, "Should Refresh Soon" will turn yellow</li>
              <li>The system will automatically refresh the token 5 minutes before expiry</li>
              <li>Try making API calls when the token is about to expire</li>
              <li>Use "Manual Refresh Token" to test the refresh functionality</li>
              <li>Use "Test API Call" to verify the token is working</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
