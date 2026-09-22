"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface NewsItem {
  src: string;
  title: string;
  description: string;
  fileName: string;
}

export default function NewsClient({ items }: { items: NewsItem[] }) {
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center text-on-surface-variant py-20">
        No news items found.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {items.map((item, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={item.fileName}
            className="group cursor-pointer flex flex-col"
            onClick={() => setSelectedItem(item)}
          >
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-surface-container border border-white/10 shadow-lg group-hover:border-primary/50 transition-colors duration-300">
              <img 
                src={item.src} 
                alt={item.title} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl">
                  <span className="material-symbols-outlined text-white">zoom_in</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center px-4">
              <h3 className="text-white font-headline font-bold text-lg group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-50"
              onClick={() => setSelectedItem(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-7xl max-h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedItem.src} 
                alt={selectedItem.title} 
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="mt-4 flex flex-col items-center text-center max-w-3xl">
                <div className="bg-surface-container border border-white/10 px-6 py-2 rounded-full flex items-center gap-2 mb-3">
                  <span className="text-white font-headline font-bold text-lg">{selectedItem.title}</span>
                </div>
                <p className="text-on-surface-variant text-base bg-black/40 px-6 py-3 rounded-2xl backdrop-blur-md">
                  {selectedItem.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
