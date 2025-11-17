import { NextRequest, NextResponse } from 'next/server';
import { APP_CONFIG } from '@/constants/config';

/**
 * Next.js API Route Proxy for Login
 * 
 * This route acts as a proxy between frontend and backend to handle
 * login requests. This ensures that cookies (especially refresh_token)
 * are set from the same domain (localhost:3000) instead of the backend domain.
 * 
 * Flow:
 * 1. Frontend calls /api/auth/login (same domain)
 * 2. Next.js receives request and forwards to backend
 * 3. Backend processes login and sets refresh_token cookie
 * 4. Next.js receives response with Set-Cookie header
 * 5. Next.js forwards Set-Cookie header to browser (same domain)
 * 6. Browser stores cookie with localhost:3000 domain
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Login request received');
      console.log('Email:', body.email);
    }

    // Forward request to backend
    const backendUrl = `${APP_CONFIG.API_BASE_URL}/api/user/login`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Forwarding login request to backend:', backendUrl);
    }
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
        data = { message: text || 'Login failed' };
      }
    } catch (error) {
      console.error('Failed to parse response:', error);
      data = { message: 'Failed to parse response' };
    }
    
    // Get Set-Cookie header from backend response (refresh_token cookie)
    const setCookieHeader = response.headers.get('Set-Cookie');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Set-Cookie header exists:', !!setCookieHeader);
      if (setCookieHeader) {
        console.log('Set-Cookie header:', setCookieHeader.substring(0, 100) + '...');
      }
    }
    
    // Convert backend response to frontend ApiResponse format
    // Backend returns: { accessToken: string, accessTokenExpiresAt: string, tokenType: string, message: string }
    // Frontend expects: { success: boolean, data: LoginResponse, error?: ApiError }
    const apiResponse = {
      success: response.ok,
      data: response.ok ? {
        accessToken: data.accessToken || data.accessToken,
        accessTokenExpiresAt: data.accessTokenExpiresAt || data.accessTokenExpiresAt,
        tokenType: data.tokenType || 'Bearer',
        message: data.message || 'Login successful!'
      } : undefined,
      error: !response.ok ? {
        status: response.status,
        message: data.message || 'Login failed',
        code: 'LOGIN_FAILED'
      } : undefined,
      message: response.ok ? data.message : undefined
    };
    
    // Create Next.js response
    const nextResponse = NextResponse.json(apiResponse, {
      status: response.status,
    });

    // Forward Set-Cookie header from backend to browser
    // This ensures cookie is set with localhost:3000 domain instead of api.edumatch.cloud
    if (setCookieHeader) {
      // Parse the cookie to remove Domain attribute
      // Backend sets: refresh_token=xxx; HttpOnly; Secure; SameSite=None; Domain=api.edumatch.cloud; Expires=...
      // We need to remove Domain attribute so browser uses current domain (localhost:3000)
      const cookieParts = setCookieHeader.split(';');
      
      // Filter out Domain attribute and rebuild cookie string
      // Browser will automatically use the current domain (localhost:3000) when Domain is not specified
      const modifiedCookieParts = cookieParts
        .map(part => part.trim())
        .filter(part => {
          const lowerPart = part.toLowerCase();
          // Remove Domain attribute (case-insensitive)
          return !lowerPart.startsWith('domain=');
        });
      
      const finalCookie = modifiedCookieParts.join('; ');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Setting cookie without Domain attribute (will use localhost)');
        console.log('Cookie (first 100 chars):', finalCookie.substring(0, 100) + '...');
      }
      
      nextResponse.headers.set('Set-Cookie', finalCookie);
    }

    return nextResponse;
  } catch (error: any) {
    console.error('Login proxy error:', error);
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

