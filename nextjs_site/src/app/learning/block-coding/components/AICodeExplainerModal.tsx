'use client';
import React, { useState, useEffect, useRef } from 'react';

interface AICodeExplainerModalProps {
  code: string;
  language: string;
  isOpen: boolean;
  onClose: () => void;
}

function formatExplanation(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '')
    .replace(/_/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export default function AICodeExplainerModal({ code, language, isOpen, onClose }: AICodeExplainerModalProps) {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && code) {
      fetchExplanation();
    }
  }, [isOpen, code]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
        };
        // Timeout fallback — some browsers never fire onvoiceschanged
        setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
      }
    });
  };

  const toggleSpeech = async () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const cleanText = stripMarkdown(explanation);
      const utterance = new SpeechSynthesisUtterance(cleanText);

      const voices = await getVoices();
      if (lang === 'hi') {
        // Try to find a Hindi voice; fall back to any voice but keep lang=hi-IN
        const hindiVoice = voices.find((v) => v.lang.startsWith('hi'));
        if (hindiVoice) utterance.voice = hindiVoice;
        utterance.lang = 'hi-IN';
      } else {
        const englishVoice = voices.find(
          (v) => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Google'))
        ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];
        if (englishVoice) utterance.voice = englishVoice;
        utterance.lang = 'en-US';
      }

      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const fetchExplanation = async (overrideLang?: 'en' | 'hi') => {
    const targetLang = overrideLang || lang;
    setLoading(true);
    setExplanation('');
    setError('');
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, responseLang: targetLang }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to explain code');
      setExplanation(data.explanation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchLang = (newLang: 'en' | 'hi') => {
    setLang(newLang);
    fetchExplanation(newLang);
  };

  if (!isOpen) return null;

  const speakBtnClass = isSpeaking
    ? 'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20'
    : 'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20';

  const loadingText = lang === 'hi' ? 'कोड पढ़ा जा रहा है...' : 'Reading your code...';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div
        ref={modalRef}
        className="bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="material-symbols-outlined text-white">smart_toy</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">AI Code Explainer</h2>
              <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400">Smart AI Analysis</p>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-white/10">
              <button
                onClick={() => switchLang('en')}
                className={lang === 'en' ? 'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white shadow' : 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors'}
              >
                EN
              </button>
              <button
                onClick={() => switchLang('hi')}
                className={lang === 'hi' ? 'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white shadow' : 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors'}
              >
                हिं
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-[#0a0a10]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-500 animate-pulse">auto_awesome</span>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">{loadingText}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex gap-3 text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined">error</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && explanation && (
            <div className="prose prose-sm dark:prose-invert prose-indigo max-w-none prose-headings:font-black prose-p:leading-relaxed">
              <div
                className="text-sm leading-relaxed text-slate-800 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: formatExplanation(explanation) }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#13131a] flex justify-between items-center">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[10px]">info</span>
            {lang === 'hi' ? 'AI गलतियाँ कर सकती है।' : 'AI can make mistakes.'}
          </p>
          <div className="flex items-center gap-3">
            {explanation && !loading && !error && (
              <button onClick={toggleSpeech} className={speakBtnClass}>
                <span className="material-symbols-outlined text-sm">{isSpeaking ? 'stop_circle' : 'volume_up'}</span>
                {isSpeaking ? (lang === 'hi' ? 'रोकें' : 'Stop') : (lang === 'hi' ? 'सुनें' : 'Read Aloud')}
              </button>
            )}
            <button
              onClick={() => fetchExplanation()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              {lang === 'hi' ? 'फिर से' : 'Regenerate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
