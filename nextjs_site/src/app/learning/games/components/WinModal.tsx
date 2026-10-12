'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import confetti from 'canvas-confetti';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextLevel: () => void;
  onRetry: () => void;
  stars: number; // 1-3
  message: string;
  levelTitle: string;
  xpEarned: number;
  newBadges: string[];
  equivalentCode: { javascript: string; python: string };
}

export default function WinModal({
  isOpen,
  onClose,
  onNextLevel,
  onRetry,
  stars,
  message,
  levelTitle,
  xpEarned,
  newBadges,
  equivalentCode,
}: WinModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showCode, setShowCode] = useState(false);
  const [displayXp, setDisplayXp] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (!prefersReducedMotion) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      let start = 0;
      const duration = 1000;
      const stepTime = Math.max(10, Math.floor(duration / Math.max(xpEarned, 1)));
      const increment = Math.max(1, Math.floor(xpEarned / (duration / 10)));
      
      const timer = setInterval(() => {
        start += increment;
        if (start > xpEarned) start = xpEarned;
        setDisplayXp(start);
        if (start >= xpEarned) clearInterval(timer);
      }, stepTime);
      
      return () => clearInterval(timer);
    } else {
      setDisplayXp(0);
      setShowCode(false);
    }
  }, [isOpen, xpEarned, prefersReducedMotion]);

  const starVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.3,
        type: 'spring' as const,
        stiffness: 260,
        damping: 20
      }
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 50 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 50 }}
            className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 text-center overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <div className="w-8" />
                <h2 className="text-3xl font-bold text-green-500">Level Complete!</h2>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{levelTitle}</p>
              
              <div className="flex justify-center gap-4 mb-6">
                {[1, 2, 3].map((star, i) => (
                  <motion.div
                    key={star}
                    custom={i}
                    variants={prefersReducedMotion ? undefined : starVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative w-16 h-16 flex items-center justify-center"
                  >
                    <span className={`material-symbols-outlined text-6xl ${star <= stars ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  </motion.div>
                ))}
              </div>

              <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">{message}</p>

              <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-4 mb-6">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +{displayXp} XP
                </span>
              </div>

              {newBadges.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">New Badges Earned!</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {newBadges.map((badge, i) => (
                      <motion.div
                        key={badge}
                        initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0 }}
                        animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1 }}
                        transition={{ delay: 1 + i * 0.2 }}
                        className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">emoji_events</span>
                        {badge.replace('-', ' ')}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6 text-left">
                <button 
                  onClick={() => setShowCode(!showCode)}
                  className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                  <span className="material-symbols-outlined text-sm">
                    {showCode ? 'expand_less' : 'expand_more'}
                  </span>
                  {showCode ? 'Hide Code' : 'Show Code'}
                </button>
                
                <AnimatePresence>
                  {showCode && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2"
                    >
                      <div className="grid grid-cols-2 gap-4 bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">JavaScript</p>
                          <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                            {equivalentCode.javascript}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Python</p>
                          <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                            {equivalentCode.python}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onRetry}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={onNextLevel}
                  className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30"
                >
                  Next Mission
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
