'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const { user, googleUser, isLoading, isAdmin } = useAuth();
  const [tokens, setTokens] = useState<any>(null);
  const [cookies, setCookies] = useState<string>('');

  useEffect(() => {
    const idToken = localStorage.getItem('cps_id_token');
    const accessToken = localStorage.getItem('cps_access_token');
    setTokens({
      idToken: idToken ? idToken.substring(0, 50) + '...' : null,
      accessToken: accessToken ? accessToken.substring(0, 50) + '...' : null,
    });

    if (typeof document !== 'undefined') {
      setCookies(document.cookie);
    }
  }, []);

  const decodedIdToken = tokens?.idToken ? localStorage.getItem('cps_id_token') : null;
  const decoded = decodedIdToken 
    ? JSON.parse(atob(decodedIdToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    : null;

  return (
    <div className="min-h-screen bg-surface p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Page</h1>

        <div className="space-y-6">
          {/* Auth Context State */}
          <div className="bg-surface-container p-6 rounded-lg border border-white/10">
            <h2 className="text-xl font-bold mb-4">Auth Context State</h2>
            <div className="space-y-2 font-mono text-xs">
              <div><span className="text-primary">isLoading:</span> {isLoading ? 'true' : 'false'}</div>
              <div><span className="text-primary">isAdmin:</span> {isAdmin ? 'true' : 'false'}</div>
              <div><span className="text-primary">user:</span> {user ? JSON.stringify({ username: user.username, email: user.attributes?.email }) : 'null'}</div>
              <div><span className="text-primary">googleUser:</span> {googleUser ? JSON.stringify(googleUser) : 'null'}</div>
            </div>
          </div>

          {/* Stored Tokens */}
          <div className="bg-surface-container p-6 rounded-lg border border-white/10">
            <h2 className="text-xl font-bold mb-4">Stored Tokens</h2>
            <div className="space-y-2 font-mono text-xs">
              <div><span className="text-primary">ID Token (first 50 chars):</span> {tokens?.idToken || 'NOT FOUND'}</div>
              <div><span className="text-primary">Access Token (first 50 chars):</span> {tokens?.accessToken || 'NOT FOUND'}</div>
            </div>
          </div>

          {/* Decoded ID Token */}
          {decoded && (
            <div className="bg-surface-container p-6 rounded-lg border border-white/10">
              <h2 className="text-xl font-bold mb-4">Decoded ID Token Payload</h2>
              <pre className="bg-black/20 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(decoded, null, 2)}
              </pre>
            </div>
          )}

          {/* Cookies */}
          <div className="bg-surface-container p-6 rounded-lg border border-white/10">
            <h2 className="text-xl font-bold mb-4">Cookies</h2>
            <pre className="bg-black/20 p-4 rounded text-xs overflow-auto max-h-96">
              {cookies || 'NO COOKIES'}
            </pre>
          </div>

          {/* LocalStorage */}
          <div className="bg-surface-container p-6 rounded-lg border border-white/10">
            <h2 className="text-xl font-bold mb-4">LocalStorage Keys</h2>
            <div className="space-y-2 font-mono text-xs">
              {typeof window !== 'undefined' && Object.keys(localStorage).map(key => (
                <div key={key}><span className="text-primary">{key}:</span> {localStorage.getItem(key)?.substring(0, 50)}...</div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-surface-container p-6 rounded-lg border border-white/10">
            <h2 className="text-xl font-bold mb-4">Debugging Steps</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Open your browser's Developer Tools (F12)</li>
              <li>Go to Console tab and look for logs starting with [OAuth], [AuthContext], or [Navbar]</li>
              <li>Try clicking "Continue with Google" on the login page</li>
              <li>Check the Network tab to see if the request to Cognito's OAuth endpoint is successful</li>
              <li>Check this debug page to see if tokens are being stored</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
