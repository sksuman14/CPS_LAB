'use client';

import React, { useState } from 'react';
import AICodeExplainerModal from './AICodeExplainerModal';


interface CodePreviewProps {
  code: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
  };
}

type Language = 'javascript' | 'python' | 'cpp' | 'java';

export default function CodePreview({ code }: CodePreviewProps) {
  const [activeLang, setActiveLang] = useState<Language>('javascript');
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);


  // Safe syntax highlighting to prevent regex collisions with HTML tags
  const highlightCode = (str: string, lang: Language) => {
    if (!str) return '';
    
    // Protect strings first
    let highlighted = str.replace(/('[^']*'|"[^"]*")/g, '___STR___$1___ENDSTR___');
    
    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="text-orange-400">$1</span>');
    
    // Restore and highlight strings
    highlighted = highlighted.replace(/___STR___(.*?)___ENDSTR___/g, '<span class="text-yellow-300">$1</span>');

    // Comments
    highlighted = highlighted
      .replace(/(\/\/.*)/g, '<span class="text-green-500/70">$1</span>') 
      .replace(/(#.*)/g, '<span class="text-green-500/70">$1</span>');

    if (lang === 'javascript') {
      highlighted = highlighted
        .replace(/\b(async|function|await|return|let|const|var|if|for|while)\b/g, '<span class="text-pink-500">$1</span>')
        .replace(/\b(car)\b/g, '<span class="text-blue-400">$1</span>');
    } else if (lang === 'python') {
      highlighted = highlighted
        .replace(/\b(def|import|from|await|async|return|if|for|in|while|pass)\b/g, '<span class="text-pink-500">$1</span>')
        .replace(/\b(car|time)\b/g, '<span class="text-blue-400">$1</span>');
    } else if (lang === 'cpp') {
      highlighted = highlighted
        .replace(/\b(void|int|float|bool|if|for|while|return|#include)\b/g, '<span class="text-pink-500">$1</span>')
        .replace(/\b(delay|car)\b/g, '<span class="text-blue-400">$1</span>');
    } else if (lang === 'java') {
      highlighted = highlighted
        .replace(/\b(public|class|static|void|int|boolean|if|for|while|return|import)\b/g, '<span class="text-pink-500">$1</span>')
        .replace(/\b(Thread|car|String)\b/g, '<span class="text-blue-400">$1</span>');
    }

    return highlighted;
  };

  const getLanguageLabel = (lang: Language) => {
    switch (lang) {
      case 'javascript': return 'JavaScript';
      case 'python': return 'Python';
      case 'cpp': return 'C / C++';
      case 'java': return 'Java';
    }
  };

  const activeCode = code[activeLang];

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-[#0a0a10] border border-slate-300 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl">
      
      {/* Tabs */}
      <div className="flex items-center bg-white dark:bg-[#13131a] border-b border-slate-200 dark:border-white/5 overflow-x-auto hide-scrollbar">
        {(['javascript', 'python', 'cpp', 'java'] as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className={`px-4 py-3 text-xs font-bold font-space tracking-wide whitespace-nowrap transition-colors border-b-2 ${
              activeLang === lang
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-white/5'
            }`}
          >
            {getLanguageLabel(lang)}
          </button>
        ))}
        
        <div className="ml-auto pr-3 flex items-center gap-2">
          {activeCode && (
            <button
              onClick={() => setIsExplainerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
              title="Explain this code with AI"
            >
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              AI Explain
            </button>
          )}
          <button
            onClick={() => navigator.clipboard.writeText(activeCode)}
            className="text-slate-700 dark:text-slate-300 dark:text-white/30 hover:text-slate-900 dark:text-white transition-colors p-2"
            title="Copy code"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-auto p-5 bg-slate-50 dark:bg-[#0a0a10]">
        <pre className="font-mono text-[13px] leading-loose text-slate-700 dark:text-slate-300">
          <code dangerouslySetInnerHTML={{ __html: highlightCode(activeCode, activeLang) }} />
        </pre>
        {!activeCode && (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 dark:text-slate-300 dark:text-white/20 text-sm font-space gap-2">
            <span className="material-symbols-outlined text-3xl">code_blocks</span>
            Drag blocks to generate code...
          </div>
        )}
      </div>
      
      <AICodeExplainerModal
        code={activeCode}
        language={getLanguageLabel(activeLang)}
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />
    </div>
  );
}

