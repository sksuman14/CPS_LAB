'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center bg-surface px-8">
      <div className="bg-surface-container rounded-3xl p-12 max-w-lg text-center border border-error/20">
        <span className="material-symbols-outlined text-4xl text-error mb-6">warning</span>
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-4">System Anomaly Detected</h2>
        <p className="font-body text-on-surface-variant mb-8">
          We encountered an unexpected error while loading this module. Our digital engineers have been notified.
        </p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => reset()} 
            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-headline font-bold hover:bg-primary transition-all"
          >
            Reboot Module
          </button>
          <Link 
            href="/"
            className="border border-outline-variant text-on-surface px-6 py-3 rounded-full font-headline font-bold hover:bg-surface-bright transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
