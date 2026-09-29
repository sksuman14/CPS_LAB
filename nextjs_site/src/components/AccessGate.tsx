'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchAllRequests, fetchUserAccess, requestDocumentAccess } from '@/lib/api/admin';
import { AccessRequest } from '@/types/admin';

interface AccessGateProps {
  /** Key used for the access request (e.g. 'IOT_LAB', 'AI_CHAT') */
  accessKey: string;
  /** Display name shown in the UI */
  moduleName: string;
  /** Tailwind gradient classes for the icon bg, e.g. 'from-blue-500 to-cyan-400' */
  gradient: string;
  /** Material Symbols icon name */
  icon: string;
  /** The actual module content rendered once access is granted */
  children: React.ReactNode;
}

export default function AccessGate({ accessKey, moduleName, gradient, icon, children }: AccessGateProps) {
  const { user, googleUser, isAdmin } = useAuth();
  const [requestStatus, setRequestStatus] = useState<AccessRequest | null>(null);
  const [userAccess, setUserAccess] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const currentEmail = user?.attributes?.email || googleUser?.email || '';
  const currentName =
    user?.username ||
    user?.attributes?.email?.split('@')[0] ||
    googleUser?.name ||
    googleUser?.email?.split('@')[0] ||
    'User';
  const currentId = user?.userId || googleUser?.email || '';

  useEffect(() => {
    async function check() {
      setIsChecking(true);
      if (!currentEmail) { setIsChecking(false); return; }
      try {
        const requests = await fetchAllRequests(currentEmail);

        const allGrant = requests.find(
          r => r.userEmail === currentEmail && r.documentName.toUpperCase() === 'ALL' && r.status === 'GRANTED'
        );
        const specific = requests.find(
          r => r.userEmail === currentEmail && r.documentName === accessKey
        );

        if (allGrant) {
          setRequestStatus({ ...allGrant, documentName: accessKey });
        } else if (specific) {
          setRequestStatus(specific);
        }

        const access = await fetchUserAccess(currentId);
        setUserAccess(access);
      } catch (e) {
        console.error(e);
      }
      setIsChecking(false);
    }
    check();
  }, [currentEmail, currentId, accessKey]);

  const hasAccess =
    isAdmin ||
    userAccess.includes(accessKey) ||
    userAccess.includes('ALL') ||
    userAccess.includes('all') ||
    requestStatus?.status === 'GRANTED';

  // ── Render children directly if access is granted ──────────────────────────
  if (!isChecking && hasAccess) return <>{children}</>;

  // ── Loading check ───────────────────────────────────────────────────────────
  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-slate-400">refresh</span>
      </div>
    );
  }

  // ── Access Gate UI ──────────────────────────────────────────────────────────
  const handleRequest = async () => {
    if (!currentEmail) return;
    setIsLoading(true);
    try {
      const result = await requestDocumentAccess(currentEmail, currentName, accessKey);
      if (result.success) {
        setRequestStatus({
          id: 'temp',
          userEmail: currentEmail,
          userName: currentName,
          documentName: accessKey,
          status: 'PENDING',
          requestDate: new Date().toISOString(),
        });
      } else {
        alert('Failed to submit request. Please try again.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-300 dark:border-white/10 flex items-center gap-4 px-6 bg-slate-50 dark:bg-[#09090b]/80 backdrop-blur-xl z-50 flex-shrink-0 sticky top-0">
        <Link
          href="/learning"
          className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-white flex items-center justify-center transition-colors border border-slate-300 dark:border-white/10"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center shadow-lg text-white`}>
            <span className="material-symbols-outlined text-lg">{icon}</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider leading-tight">{moduleName}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CPS Lab</p>
          </div>
        </div>
      </header>

      {/* Gate Body */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr ${gradient} opacity-5 rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '7s' }} />
          <div className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr ${gradient} opacity-5 rounded-full blur-3xl animate-pulse`} style={{ animationDuration: '11s' }} />
        </div>

        <div className="relative z-10 max-w-md w-full">
          {/* Icon */}
          <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center shadow-2xl mx-auto mb-8`}>
            <span className="material-symbols-outlined text-5xl text-white">{icon}</span>
          </div>

          <h2 className="text-3xl font-black text-white mb-2">{moduleName}</h2>
          <p className="text-slate-400 mb-8">Access to this module is restricted. Request permission from an admin to continue.</p>

          {/* State card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            {/* Not logged in */}
            {!user && !googleUser && (
              <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-slate-400">lock</span>
                <p className="text-slate-300 text-sm">You need to sign in first to request access.</p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-bold transition-all"
                >
                  <span className="material-symbols-outlined text-sm">login</span>
                  Sign In
                </Link>
              </div>
            )}

            {/* Pending */}
            {(user || googleUser) && requestStatus?.status === 'PENDING' && (
              <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-yellow-400 animate-pulse">pending</span>
                <p className="text-yellow-300 font-bold text-sm">Access Request Pending</p>
                <p className="text-slate-400 text-xs">Your request has been sent to the admin. You'll get access once it's approved.</p>
              </div>
            )}

            {/* Request access */}
            {(user || googleUser) && !requestStatus && (
              <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-blue-400">verified_user</span>
                <p className="text-slate-300 text-sm">Click below to request access from the admin.</p>
                <button
                  onClick={handleRequest}
                  disabled={isLoading}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${gradient} text-white font-bold shadow-lg hover:brightness-110 transition-all disabled:opacity-50`}
                >
                  <span className={`material-symbols-outlined text-sm ${isLoading ? 'animate-spin' : ''}`}>
                    {isLoading ? 'refresh' : 'send'}
                  </span>
                  {isLoading ? 'Submitting...' : 'Request Access'}
                </button>
              </div>
            )}
          </div>

          <Link href="/learning" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← Back to Learning Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
