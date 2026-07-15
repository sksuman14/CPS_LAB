"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface/70 border border-outline/20">
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>
          dark_mode
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors border border-outline/20 hover:border-outline/40 shadow-sm relative overflow-hidden"
      aria-label="Toggle Theme"
    >
      <span
        className={`material-symbols-outlined text-[20px] absolute transition-all duration-300 ${
          theme === "dark" ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
        }`}
        style={{ fontVariationSettings: "'FILL' 0" }}
      >
        dark_mode
      </span>
      <span
        className={`material-symbols-outlined text-[20px] absolute transition-all duration-300 ${
          theme === "light" ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
        }`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        light_mode
      </span>
    </button>
  );
}
