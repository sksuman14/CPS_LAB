"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";

interface GalleryItem {
  src: string;
  location: string;
  description?: string;
  fileName: string;
}

export default function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Fallback if no images found
  if (items.length === 0) {
    return (
      <div className="text-center text-on-surface-variant py-20">
        No gallery images found.
      </div>
    );
  }

  return (
    <>
       <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-8 space-y-8">
        {items.map((item, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index % 10) * 0.05 }}
            key={item.fileName}
            className="break-inside-avoid"
          >
            <div 
              className="relative group flex flex-col rounded-2xl overflow-hidden bg-surface-container border border-white/10 cursor-pointer shadow-lg hover:border-primary/50 transition-colors duration-300"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative w-full overflow-hidden">
                <img 
                  src={item.src} 
                  alt={item.location} 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl">
                    <span className="material-symbols-outlined text-white">zoom_in</span>
                  </div>
                </div>
              </div>
              <div className="p-3 text-center bg-surface-container">
                <p className="text-white font-headline font-bold text-sm group-hover:text-primary transition-colors">
                  {item.location}
                </p>
              </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              onClick={() => setSelectedItem(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedItem.src} 
                alt={selectedItem.location} 
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="mt-4 flex flex-col items-center text-center max-w-3xl">
                <div className="bg-surface-container border border-white/10 px-6 py-2 rounded-full flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                  <span className="text-white font-headline font-bold text-lg">{selectedItem.location}</span>
                </div>
                {selectedItem.description && (
                  <p className="text-on-surface-variant text-base bg-black/40 px-6 py-3 rounded-2xl backdrop-blur-md">
                    {selectedItem.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
