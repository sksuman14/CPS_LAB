'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  handleGetCurrentUser, 
  handleSignOut, 
  isUserAdmin 
} from '../lib/auth';
import { AuthUser, FetchUserAttributesOutput } from 'aws-amplify/auth';
import { configureAmplify } from '../lib/amplify-config';
import { Hub } from 'aws-amplify/utils';
import { useRouter } from 'next/navigation';

const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'https://auth.cpslabhub.com';
const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '1mrpdo856s8ilqavv7kkn8vm97';
const REDIRECT_URI = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? `${window.location.origin}/home`
  : 'https://www.cpslabhub.com/home';

interface AuthContextType {
  user: (AuthUser & { attributes: FetchUserAttributesOutput }) | null;
  isLoading: boolean;
  isAdmin: boolean;
  googleUser: { email: string; name: string; picture?: string } | null;
  checkUserSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (base64.length % 4)) % 4;
    const paddedBase64 = base64.padEnd(base64.length + padLength, '=');
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('[AuthContext] JWT decode error:', err);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(AuthUser & { attributes: FetchUserAttributesOutput }) | null>(null);
  const [googleUser, setGoogleUser] = useState<{ email: string; name: string; picture?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshGoogleTokens = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    const refreshToken = localStorage.getItem('cps_refresh_token');
    if (!refreshToken) {
      console.log('[AuthContext] No refresh token available');
      return false;
    }

    try {
      console.log('[AuthContext] Attempting token refresh...');
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: COGNITO_CLIENT_ID,
        refresh_token: refreshToken,
      });

      const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!response.ok) {
        console.error('[AuthContext] Token refresh failed:', response.status);
        return false;
      }

      const tokens = await response.json();
      localStorage.setItem('cps_access_token', tokens.access_token);
      localStorage.setItem('cps_id_token', tokens.id_token);
      // Cognito refresh response doesn't return a new refresh_token, keep the old one

      // Set cookie for 30 days
      const maxAge = 30 * 24 * 60 * 60; // 30 days
      document.cookie = `cps_id_token=${tokens.id_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `cps_logged_in=true; path=/; max-age=${maxAge}; SameSite=Lax`;

      console.log('[AuthContext] Token refresh successful');
      return true;
    } catch (err) {
      console.error('[AuthContext] Token refresh error:', err);
      return false;
    }
  };

  const checkGoogleTokens = async () => {
    let idToken = typeof window !== 'undefined' ? localStorage.getItem('cps_id_token') : null;
    
    if (!idToken && typeof document !== 'undefined') {
      const cookieMap: any = {};
      document.cookie.split(';').forEach(c => {
        const [k, v] = c.split('=');
        if (k && v) cookieMap[k.trim()] = v.trim();
      });
      idToken = cookieMap['cps_id_token'];
    }

    if (!idToken) {
      console.log('[AuthContext] No ID token found');
      return false;
    }

    const payload = decodeJwt(idToken);
    if (!payload) {
      console.error('[AuthContext] Failed to decode JWT');
      return false;
    }

    console.log('[AuthContext] JWT payload:', { email: payload.email, name: payload.name, cognito_username: payload['cognito:username'] });

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn('[AuthContext] ID token expired, trying refresh...');
      const refreshed = await refreshGoogleTokens();
      if (refreshed) {
        // Re-read the fresh token
        idToken = localStorage.getItem('cps_id_token');
        if (!idToken) return false;
        const newPayload = decodeJwt(idToken);
        if (!newPayload) return false;
        const gUser = {
          email: newPayload.email || '',
          name: newPayload.name || newPayload.given_name || (newPayload.email ? newPayload.email.split('@')[0] : 'User'),
          picture: newPayload.picture,
        };
        console.log('[AuthContext] Refreshed Google user:', gUser);
        setGoogleUser(gUser);
        setIsAdmin(isUserAdmin(gUser.email));
        return true;
      }
      // Refresh failed — clear everything
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cps_id_token');
        localStorage.removeItem('cps_access_token');
        localStorage.removeItem('cps_refresh_token');
        document.cookie = "cps_id_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "cps_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      return false;
    }

    const gUser = {
      email: payload.email || '',
      name: payload.name || payload.given_name || (payload.email ? payload.email.split('@')[0] : 'User'),
      picture: payload.picture,
    };

    console.log('[AuthContext] Setting Google user:', gUser);
    setGoogleUser(gUser);
    setIsAdmin(isUserAdmin(gUser.email));
    return true;
  };

  const handleOAuthCallback = async () => {
    if (typeof window === 'undefined') return false;
    
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return false;

    console.log('[AuthContext] Found OAuth code, exchanging...');
    
    try {
      const origin = window.location.origin;
      const redirectUri = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? `${origin}/home`
        : 'https://www.cpslabhub.com/home';
      
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: COGNITO_CLIENT_ID,
        code,
        redirect_uri: redirectUri,
      });

      const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`Token exchange failed: ${responseText}`);
      }

      const tokens = JSON.parse(responseText);
      localStorage.setItem('cps_access_token', tokens.access_token);
      localStorage.setItem('cps_id_token', tokens.id_token);
      if (tokens.refresh_token) {
        localStorage.setItem('cps_refresh_token', tokens.refresh_token);
      }

      const maxAge = 30 * 24 * 60 * 60; // 30 days — keep user logged in
      document.cookie = `cps_id_token=${tokens.id_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `cps_logged_in=true; path=/; max-age=${maxAge}; SameSite=Lax`;

      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      console.log('[AuthContext] OAuth exchange successful');
      return true;
    } catch (err) {
      console.error('[AuthContext] OAuth exchange error:', err);
      window.history.replaceState({}, '', window.location.pathname);
      return false;
    }
  };

  const checkUserSession = async () => {
    setIsLoading(true);
    
    // Check for code in URL first
    const hasExchanged = await handleOAuthCallback();
    
    try {
      const currentUser = await handleGetCurrentUser();
      if (currentUser && currentUser.userId) {
        console.log('[AuthContext] Amplify user found:', currentUser.username);
        setUser(currentUser as any);
        setGoogleUser(null);
        const email = (currentUser as any).attributes?.email;
        setIsAdmin(!!email && isUserAdmin(email));
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.log('[AuthContext] No Amplify user found, checking for Google tokens...');
    }

    const hasGoogle = await checkGoogleTokens();
    if (!hasGoogle) {
      console.log('[AuthContext] No Google tokens found, clearing auth state');
      setUser(null);
      setGoogleUser(null);
      setIsAdmin(false);
    }
    setIsLoading(false);
  };

  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cps_id_token');
      localStorage.removeItem('cps_access_token');
      document.cookie = "cps_id_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "cps_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Redirect to Cognito logout ONLY if Google User
      if (googleUser) {
        const logoutUri = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? `${window.location.origin}/home`
          : 'https://www.cpslabhub.com/home';
        const cognitoLogoutUrl = `${COGNITO_DOMAIN}/logout?client_id=${COGNITO_CLIENT_ID}&logout_uri=${encodeURIComponent(logoutUri)}`;
        window.location.href = cognitoLogoutUrl;
        return; // Browser is navigating away
      }
    }
    
    // For Amplify native user (username/password)
    try { await handleSignOut(); } catch (err) { console.error('Signout error:', err); }
    setUser(null);
    setGoogleUser(null);
    setIsAdmin(false);
  };

  useEffect(() => {
    configureAmplify();
    checkUserSession();
    const sub = Hub.listen('auth', () => checkUserSession());
    return () => sub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, googleUser, checkUserSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}