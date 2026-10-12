'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface FailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  message: string;
  levelTitle: string;
  hint: string;
}

export default function FailModal({
  isOpen,
  onClose,
  onRetry,
  message,
  levelTitle,
  hint
}: FailModalProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-900/30 backdrop-blur-sm">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 50 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 50 }}
            className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 text-center overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <div className="w-8" />
                <motion.div
                  animate={prefersReducedMotion ? {} : {
                    rotate: [-10, 10, -10, 10, 0],
                    transition: { duration: 0.5, delay: 0.2 }
                  }}
                  className="inline-block"
                >
                  <span className="material-symbols-outlined text-6xl text-red-500">
                    smart_toy
                  </span>
                </motion.div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <h2 className="text-3xl font-bold text-red-500 mb-2">Oops!</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{levelTitle}</p>
              
              <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-8">{message}</p>

              {hint && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4 mb-8 text-left flex gap-3">
                  <span className="material-symbols-outlined text-yellow-500 shrink-0">
                    lightbulb
                  </span>
                  <div>
                    <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-sm mb-1">Hint</h4>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">{hint}</p>
                  </div>
                </div>
              )}

              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                animate={prefersReducedMotion ? {} : {
                  scale: [1, 1.02, 1],
                  transition: { repeat: Infinity, duration: 2 }
                }}
                onClick={onRetry}
                className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-500/30"
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
