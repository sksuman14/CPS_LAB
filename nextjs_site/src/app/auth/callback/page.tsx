'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'https://auth.cpslabhub.com';
const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '1mrpdo856s8ilqavv7kkn8vm97';
const REDIRECT_URI = typeof window !== 'undefined'
  ? `${window.location.origin}/home`
  : 'https://www.cpslabhub.com/home';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('🔐 [OAuth Callback] Received:', { code: !!code, error, errorDescription });

        if (error) {
          throw new Error(`OAuth Error: ${error} - ${errorDescription}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Cognito');
        }

        console.log('🔐 [OAuth Callback] Exchanging code for tokens...');
        setStatus('processing');

        const tokenUrl = `${COGNITO_DOMAIN}/oauth2/token`;
        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: COGNITO_CLIENT_ID,
          code,
          redirect_uri: REDIRECT_URI,
        });

        console.log('🔐 [OAuth Callback] Token request to:', tokenUrl);

        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
          credentials: 'include',
        });

        const responseText = await response.text();
        console.log('🔐 [OAuth Callback] Token response status:', response.status);

        if (!response.ok) {
          console.error('🔴 [OAuth Callback] Token exchange failed:', responseText);
          throw new Error(`Token exchange failed: ${response.status} - ${responseText}`);
        }

        const tokens = JSON.parse(responseText);
        console.log('✅ [OAuth Callback] Token exchange successful');

        // Store tokens
        if (tokens.access_token) {
          localStorage.setItem('cps_access_token', tokens.access_token);
        }
        if (tokens.id_token) {
          localStorage.setItem('cps_id_token', tokens.id_token);
          const maxAge = tokens.expires_in || 3600;
          document.cookie = `cps_id_token=${tokens.id_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        }
        if (tokens.refresh_token) {
          localStorage.setItem('cps_refresh_token', tokens.refresh_token);
        }

        // Mark as logged in
        document.cookie = `cps_logged_in=true; path=/; SameSite=Lax`;

        console.log('✅ [OAuth Callback] Tokens stored, redirecting to home...');
        setStatus('success');

        // Small delay before redirect
        setTimeout(() => {
          router.push('/home');
        }, 500);
      } catch (err: any) {
        console.error('🔴 [OAuth Callback] Error:', err.message);
        setErrorMsg(err.message || 'Authentication failed');
        setStatus('error');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-label tracking-widest uppercase text-xs animate-pulse">
              Authenticating with Google...
            </p>
            <p className="text-white/50 text-[10px] mt-4">Please wait while we complete your login</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <div className="material-symbols-outlined text-3xl text-green-500">check_circle</div>
            </div>
            <p className="text-white font-label tracking-widest uppercase text-xs">
              Login Successful!
            </p>
            <p className="text-white/50 text-[10px] mt-4">Redirecting to home...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <div className="material-symbols-outlined text-3xl text-red-500">error</div>
            </div>
            <p className="text-white font-label tracking-widest uppercase text-xs">
              Authentication Failed
            </p>
            <p className="text-red-400 text-[10px] mt-4 break-words">{errorMsg}</p>
            <p className="text-white/50 text-[10px] mt-2">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
}
