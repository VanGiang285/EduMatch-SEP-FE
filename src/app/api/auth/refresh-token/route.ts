import { NextRequest, NextResponse } from 'next/server';
import { APP_CONFIG } from '@/constants/config';

/**
 * Next.js API Route Proxy for Refresh Token
 * 
 * This route acts as a proxy between frontend and backend to handle
 * refresh token requests. Since backend sets cookie with SameSite=Strict,
 * we need to proxy through Next.js (same domain) to forward the cookie.
 * 
 * Flow:
 * 1. Frontend calls /api/auth/refresh-token (same domain)
 * 2. Next.js receives request with cookie from browser
 * 3. Next.js forwards request + cookie to backend
 * 4. Backend processes and returns new access token
 * 5. Next.js forwards response back to frontend
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token cookie from request
    const refreshTokenCookie = request.cookies.get('refresh_token');
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Refresh token request received');
      console.log('Cookies:', request.cookies.getAll().map(c => c.name));
      console.log('Refresh token cookie exists:', !!refreshTokenCookie);
    }
    
    if (!refreshTokenCookie) {
      return NextResponse.json(
        {
          success: false,
          error: {
            status: 401,
            message: 'No refresh token found',
            code: 'NO_REFRESH_TOKEN'
          }
        },
        { status: 401 }
      );
    }

    // Forward request to backend with cookie
    const backendUrl = `${APP_CONFIG.API_BASE_URL}/api/user/refresh-token`;
    
    // Build cookie header to forward to backend
    // Get all cookies from request and forward them
    const allCookies = request.cookies.getAll();
    const cookieHeader = allCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Forwarding refresh token request to backend:', backendUrl);
      console.log('Cookie header length:', cookieHeader.length);
    }
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader, // Forward all cookies to backend
      },
      // Note: Using manual Cookie header instead of credentials: 'include'
      // because we're proxying from Next.js to backend
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 Backend response status:', response.status);
    }

    // Get response data
    let data: any;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || 'Token refresh failed' };
      }
    } catch (error) {
      console.error('Failed to parse response:', error);
      data = { message: 'Failed to parse response' };
    }
    
    // Get Set-Cookie header from backend response (if any)
    const setCookieHeader = response.headers.get('Set-Cookie');
    
    // Convert backend response to frontend ApiResponse format
    // Backend returns: { accessToken: string, expiresAt: string }
    // Frontend expects: { success: boolean, data: LoginResponse, error?: ApiError }
    const apiResponse = {
      success: response.ok,
      data: response.ok ? {
        accessToken: data.accessToken || data.accessToken,
        accessTokenExpiresAt: data.expiresAt || data.accessTokenExpiresAt,
        tokenType: 'Bearer',
        message: 'Token refreshed successfully'
      } : undefined,
      error: !response.ok ? {
        status: response.status,
        message: data.message || 'Token refresh failed',
        code: 'REFRESH_TOKEN_FAILED'
      } : undefined,
      message: response.ok ? 'Token refreshed successfully' : undefined
    };
    
    // Create Next.js response
    const nextResponse = NextResponse.json(apiResponse, {
      status: response.status,
    });

    // Forward Set-Cookie header from backend to browser
    if (setCookieHeader) {
      // Parse and forward the cookie
      // Backend sets: refresh_token=xxx; HttpOnly; Secure; SameSite=None; Expires=...
      nextResponse.headers.set('Set-Cookie', setCookieHeader);
    }

    return nextResponse;
  } catch (error: any) {
    console.error('Refresh token proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          status: 500,
          message: error.message || 'Internal server error',
          code: 'PROXY_ERROR'
        }
      },
      { status: 500 }
    );
  }
}

