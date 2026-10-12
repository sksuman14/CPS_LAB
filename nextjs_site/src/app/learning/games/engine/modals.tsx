'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface WinModalProps {
  stars: number;
  message: string;
  xpEarned: number;
  newBadges: string[];
  onNext: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  stars,
  message,
  xpEarned,
  newBadges,
  onNext,
  onRetry,
  onClose,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-gray-800"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="mb-6 flex justify-center space-x-2">
            {[1, 2, 3].map((starIndex) => {
              const isEarned = starIndex <= stars;
              return (
                <motion.div
                  key={starIndex}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: starIndex * 0.2, type: 'spring' }}
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    isEarned ? 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                  }`}
                >
                  <span className={`material-symbols-outlined text-4xl ${isEarned ? '' : 'font-light'}`}>
                    {isEarned ? 'star' : 'star_outline'}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <h2 className="mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-3xl font-bold text-transparent">
            Mission Complete!
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">{message}</p>

          <div className="mb-6 flex justify-center">
            <div className="flex items-center space-x-2 rounded-full bg-indigo-50 px-4 py-2 text-indigo-700 shadow-inner dark:bg-indigo-900/30 dark:text-indigo-300">
              <span className="material-symbols-outlined">military_tech</span>
              <span className="font-bold">+{xpEarned} XP</span>
            </div>
          </div>

          {newBadges.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                New Badges Earned
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {newBadges.map((badge, idx) => (
                  <div key={idx} className="flex items-center space-x-1 rounded-md bg-green-50 px-3 py-1 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <span className="material-symbols-outlined text-sm">workspace_premium</span>
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
            <button
              onClick={onRetry}
              className="flex-1 rounded-xl border-2 border-gray-200 py-3 font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Retry
            </button>
            <button
              onClick={onNext}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 font-semibold text-white shadow-lg hover:from-indigo-600 hover:to-purple-600"
            >
              Next Mission &rarr;
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface FailModalProps {
  message: string;
  hint: string;
  onRetry: () => void;
  onClose: () => void;
}

export const FailModal: React.FC<FailModalProps> = ({
  message,
  hint,
  onRetry,
  onClose,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-md overflow-hidden rounded-2xl border-4 border-red-100 bg-white p-8 text-center shadow-2xl dark:border-red-900/50 dark:bg-gray-800"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-900/30">
              <span className="material-symbols-outlined text-5xl">sentiment_dissatisfied</span>
            </div>
          </div>

          <h2 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
            Not Quite!
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">{message}</p>

          {hint && (
            <div className="mb-8 rounded-xl bg-orange-50 p-4 text-left dark:bg-orange-900/20">
              <div className="mb-1 flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                <span className="text-xs font-bold uppercase tracking-wider">Hint</span>
              </div>
              <p className="text-sm text-orange-800 dark:text-orange-300">{hint}</p>
            </div>
          )}

          <button
            onClick={onRetry}
            className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-500 py-3 font-semibold text-white shadow-lg hover:from-red-600 hover:to-orange-600"
          >
            Try Again
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
