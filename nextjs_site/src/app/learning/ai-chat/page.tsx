'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AccessGate from '@/components/AccessGate';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'model',
    content: "Hi there! I'm your AI Tutor. Ask me anything about sensors, robotics, or how to code your projects!"
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages.filter(m => m.id !== '1'),
          message: userMsg.content,
          lang,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect to AI');
      }

      const modelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: data.reply };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: `Oops! âŒ ${err.message}` };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AccessGate accessKey="AI_CHAT" moduleName="AI Chat Assistant" gradient="from-violet-500 to-purple-400" icon="smart_toy">
    <div className="h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-300 dark:border-white/10 flex items-center justify-between px-6 bg-slate-50 dark:bg-[#09090b]/80 backdrop-blur-xl z-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/learning" className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-white flex items-center justify-center transition-colors border border-slate-300 dark:border-white/10">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider leading-tight">AI Chat Assistant</h1>
              <p className="text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">Smart AI Assistant</p>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setLang('en')}
              className={lang === 'en' ? 'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500 text-white shadow' : 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors'}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={lang === 'hi' ? 'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white shadow' : 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors'}
            >
              {'\u0939\u093F\u0902'}
            </button>
          </div>
        </div>
      </header>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex flex-col gap-6">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              
              {/* Avatar */}
              <div className="flex-shrink-0 mt-1">
                {msg.role === 'user' ? (
                  <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-800 flex items-center justify-center border border-slate-400 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-purple-400 flex items-center justify-center shadow-lg text-white">
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div className={`p-4 rounded-3xl ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-tr-sm shadow-md' 
                  : 'bg-white dark:bg-[#13131a] text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-white/10 shadow-lg'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-[15px] font-medium whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n\n/g, '</p><p>')
                        .replace(/\x60\x60\x60([\s\S]*?)\x60\x60\x60/g, '<pre><code>$1</code></pre>') 
                        .replace(/\x60(.*?)\x60/g, '<code class="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-1 py-0.5 rounded">$1</code>') 
                    }} 
                  />
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 max-w-[80%]">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-purple-400 flex items-center justify-center shadow-lg text-white">
                  <span className="material-symbols-outlined text-xl animate-pulse">auto_awesome</span>
                </div>
              </div>
              <div className="p-4 rounded-3xl bg-white dark:bg-[#13131a] rounded-tl-sm border border-slate-200 dark:border-white/10 shadow-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-[#13131a] border-t border-slate-200 dark:border-white/10 p-4 z-10 flex-shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder={lang === 'hi' ? '\u0905\u092a\u0928\u093e \u0938\u0935\u093e\u0932 \u092a\u0942\u091b\u0947\u0902...' : 'Ask a question about sensors or code...'}
            className="w-full bg-slate-100 dark:bg-[#09090b] text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 rounded-full px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-slate-500 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 w-10 h-10 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-400 disabled:dark:bg-slate-700 text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-lg ml-0.5">send</span>
          </button>
        </form>
      </div>
    </div>
    </AccessGate>
  );
}

