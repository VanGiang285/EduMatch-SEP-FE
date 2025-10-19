"use client";
import { Button } from "../ui/basic/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomToast } from "@/hooks/useCustomToast";
import { useState, useEffect } from "react";
import { APP_CONFIG } from "@/constants/config";
import { debugGoogleToken } from "@/lib/debug-google-token";
interface GoogleSignInButtonProps {
  mode?: 'signin' | 'signup';
  disabled?: boolean;
  className?: string;
}
export function GoogleSignInButton({ 
  mode = 'signin', 
  disabled = false,
  className = ""
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const { googleLogin } = useAuth();
  const { showSuccess, showError } = useCustomToast();
  useEffect(() => {
    const initializeGoogle = async () => {
      try {
        // Load Google Identity Services script
        if (!window.google?.accounts?.id) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        // Initialize Google Identity Services
        window.google?.accounts?.id?.initialize({
          client_id: APP_CONFIG.EXTERNAL.GOOGLE_CLIENT_ID || '',
          callback: async (response: any) => {
            if (response.credential) {
              try {
                setIsLoading(true);
                // Debug Google ID Token
                console.log('🔍 Debugging Google ID Token...');
                debugGoogleToken.testToken(response.credential);
                await googleLogin(response.credential);
                showSuccess(mode === 'signin' ? 'Đăng nhập thành công!' : 'Đăng ký thành công!');
              } catch (error: any) {
                console.error('Google sign in error:', error);
                showError(error.message || 'Đăng nhập Google thất bại');
              } finally {
                setIsLoading(false);
              }
            }
          },
          auto_select: true,
          cancel_on_tap_outside: false,
          ux_mode: 'popup',
          itp_support: true,
          context: 'signin',
          state_cookie_domain: window.location.hostname,
        });
        setIsGoogleLoaded(true);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
      }
    };
    initializeGoogle();
  }, [googleLogin, mode]);
  const handleGoogleSignIn = async () => {
    if (disabled || isLoading || !isGoogleLoaded) return;
    try {
      setIsLoading(true);
      // Trigger Google OAuth popup
      window.google?.accounts?.id?.prompt((notification: any) => {
        console.log('Google prompt notification:', notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: show popup manually
          window.google?.accounts?.oauth2?.initTokenClient({
            client_id: APP_CONFIG.EXTERNAL.GOOGLE_CLIENT_ID || '',
            scope: 'email profile',
            callback: async (response: any) => {
              if (response.access_token) {
                // Get user info from Google
                const userInfo = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`);
                const userData = await userInfo.json();
                // Create a mock ID token for our backend
                const mockIdToken = btoa(JSON.stringify({
                  iss: 'https://accounts.google.com',
                  aud: APP_CONFIG.EXTERNAL.GOOGLE_CLIENT_ID,
                  sub: userData.id,
                  email: userData.email,
                  email_verified: true,
                  name: userData.name,
                  picture: userData.picture,
                  given_name: userData.given_name,
                  family_name: userData.family_name,
                }));
                await googleLogin(mockIdToken);
                showSuccess(mode === 'signin' ? 'Đăng nhập thành công!' : 'Đăng ký thành công!');
              }
            }
          }).requestAccessToken();
        }
      });
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Đăng nhập Google thất bại');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading || !isGoogleLoaded}
      className={`w-full h-10 sm:h-11 lg:h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium text-sm sm:text-base shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {isLoading 
        ? (mode === 'signin' ? 'Đang đăng nhập...' : 'Đang đăng ký...')
        : (mode === 'signin' ? 'Đăng nhập với Google' : 'Đăng ký với Google')
      }
    </Button>
  );
}