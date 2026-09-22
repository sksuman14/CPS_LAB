"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface NewsItem {
  src: string;
  title: string;
  description: string;
  fileName: string;
}

interface NewsGroup {
  title: string;
  description: string;
  images: NewsItem[];
}

function NewsGroupCard({ group, onClick, index }: { group: NewsGroup; onClick: () => void; index: number }) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    if (group.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % group.images.length);
    }, 3000 + (index * 500)); // Stagger animations slightly so they don't all flip at the same millisecond
    
    return () => clearInterval(interval);
  }, [group.images.length, index]);

  const currentImage = group.images[currentImageIdx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer flex flex-col"
      onClick={onClick}
    >
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-surface-container border border-white/10 shadow-lg group-hover:border-primary/50 transition-colors duration-300">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage.src}
            src={currentImage.src}
            alt={currentImage.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </AnimatePresence>
        
        {group.images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 z-10">
            <span className="text-white text-xs font-mono font-bold">
              {currentImageIdx + 1} / {group.images.length}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center z-20">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl">
            <span className="material-symbols-outlined text-white">zoom_in</span>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center px-4">
        <h3 className="text-white font-headline font-bold text-lg group-hover:text-primary transition-colors">
          {group.title}
        </h3>
        <p className="text-sm text-on-surface-variant mt-2">
          {group.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function NewsClient({ items }: { items: NewsItem[] }) {
  const [selectedGroup, setSelectedGroup] = useState<NewsGroup | null>(null);
  const [modalImageIdx, setModalImageIdx] = useState(0);

  const groupedItems = useMemo(() => {
    const groups: Record<string, NewsGroup> = {};
    items.forEach((item) => {
      if (!groups[item.title]) {
        groups[item.title] = { title: item.title, description: item.description, images: [] };
      }
      groups[item.title].images.push(item);
    });
    return Object.values(groups);
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="text-center text-on-surface-variant py-20">
        No news items found.
      </div>
    );
  }

  const nextModalImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedGroup) return;
    setModalImageIdx((prev) => (prev + 1) % selectedGroup.images.length);
  };

  const prevModalImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedGroup) return;
    setModalImageIdx((prev) => (prev - 1 + selectedGroup.images.length) % selectedGroup.images.length);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {groupedItems.map((group, index) => (
          <NewsGroupCard 
            key={group.title} 
            group={group} 
            index={index} 
            onClick={() => {
              setSelectedGroup(group);
              setModalImageIdx(0);
            }} 
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedGroup(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-50"
              onClick={() => setSelectedGroup(null)}
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
              <div className="relative flex items-center justify-center w-full max-w-5xl">
                {selectedGroup.images.length > 1 && (
                  <button 
                    onClick={prevModalImage}
                    className="absolute left-0 md:-left-16 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
                  >
                    <ChevronLeft className="w-10 h-10 md:w-12 md:h-12" />
                  </button>
                )}
                
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={selectedGroup.images[modalImageIdx].src}
                    src={selectedGroup.images[modalImageIdx].src} 
                    alt={selectedGroup.title} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                  />
                </AnimatePresence>

                {selectedGroup.images.length > 1 && (
                  <button 
                    onClick={nextModalImage}
                    className="absolute right-0 md:-right-16 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
                  >
                    <ChevronRight className="w-10 h-10 md:w-12 md:h-12" />
                  </button>
                )}
              </div>

              <div className="mt-6 flex flex-col items-center text-center max-w-3xl">
                <div className="bg-surface-container border border-white/10 px-6 py-2 rounded-full flex items-center gap-4 mb-3">
                  <span className="text-white font-headline font-bold text-lg">{selectedGroup.title}</span>
                  {selectedGroup.images.length > 1 && (
                    <span className="text-primary text-sm font-mono bg-primary/10 px-3 py-1 rounded-full">
                      {modalImageIdx + 1} / {selectedGroup.images.length}
                    </span>
                  )}
                </div>
                <p className="text-on-surface-variant text-base bg-black/40 px-6 py-3 rounded-2xl backdrop-blur-md">
                  {selectedGroup.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
