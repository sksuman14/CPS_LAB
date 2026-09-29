'use client';

import Link from 'next/link';

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col font-sans">

      {/* Header — same style as other learning modules */}
      <header className="h-16 border-b border-slate-300 dark:border-white/10 flex items-center gap-4 px-6 bg-slate-50 dark:bg-[#09090b]/80 backdrop-blur-xl z-50 flex-shrink-0 sticky top-0">
        <Link
          href="/learning"
          className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-white flex items-center justify-center transition-colors border border-slate-300 dark:border-white/10"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg text-white">
            <span className="material-symbols-outlined text-lg">explore</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider leading-tight">Coding Adventures</h1>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Master Logic &amp; Algorithms</p>
          </div>
        </div>
      </header>

      {/* Coming Soon Body */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">

        {/* Background glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '11s' }} />
        </div>

        <div className="relative z-10 max-w-lg">
          {/* Icon */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-indigo-500/30 mx-auto mb-8">
            <span className="material-symbols-outlined text-5xl text-white">rocket_launch</span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-6">
            <span className="material-symbols-outlined text-sm">schedule</span>
            Coming Soon
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Coding{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Adventures
            </span>
          </h2>

          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            We&apos;re building an epic galaxy of block-coding challenges. Get ready to program robots, drones, and rockets! 🚀
          </p>

          {/* Progress indicators */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {['Robot Assembly', 'Drone Navigation', 'Rocket Launch'].map((name, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-400 text-lg">lock</span>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{name}</span>
              </div>
            ))}
          </div>

          <Link
            href="/learning"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-bold transition-all"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Learning Hub
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   ORIGINAL GAMES CODE — Commented out, preserved for future use
   =====================================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const GAMES_PATH = [
  { id: 'robot-puzzle', title: 'Robot Assembly', icon: 'smart_toy', color: 'bg-emerald-500', shadow: 'shadow-emerald-700', ring: 'ring-emerald-400/50', desc: 'Introduction to logic and snapping blocks together.', question: 'Connect the correct logic and action blocks together in the workspace to activate your AI robot buddy!', x: 10, y: 40 },
  { id: 'maze', title: 'Rover Escape', icon: 'explore', color: 'bg-blue-500', shadow: 'shadow-blue-700', ring: 'ring-blue-400/50', desc: 'Help the robotic rover escape the testing grid!', question: 'Navigate the smart rover through the grid to reach the checkered flag without hitting any obstacles!', x: 25, y: 70 },
  { id: 'drone', title: 'Drone Navigation', icon: 'flight_takeoff', color: 'bg-yellow-500', shadow: 'shadow-yellow-700', ring: 'ring-yellow-400/50', desc: 'Dive into control-flow and headings.', question: "Program the drone's flight path! Set the correct angle heading, and use an IF/ELSE block to fly high over obstacles.", x: 45, y: 50 },
  { id: 'plotter', title: 'Plotter Bot', icon: 'precision_manufacturing', color: 'bg-indigo-500', shadow: 'shadow-indigo-700', ring: 'ring-indigo-400/50', desc: 'Use nested loops to program a robotic drawing arm.', question: 'Draw a glowing star! Use a repeat loop to move the robotic pen forward and turn right 144 degrees, 5 times in a row.', x: 60, y: 20 },
  { id: 'rocket-anim', title: 'Rocket Launch', icon: 'rocket', color: 'bg-purple-500', shadow: 'shadow-purple-700', ring: 'ring-purple-400/50', desc: 'Use math to animate objects on screen.', question: "Animate the rocket launch! Create a mathematical equation block that increases the rocket's height as time increases.", x: 80, y: 40 },
  { id: 'traffic-light', title: 'Traffic Control', icon: 'traffic', color: 'bg-pink-500', shadow: 'shadow-pink-700', ring: 'ring-pink-400/50', desc: 'Automate city infrastructure using variables.', question: 'Manage the city intersection! If the timer variable hits 10, change the traffic light to GREEN.', x: 70, y: 80 },
  { id: 'space-rescue', title: 'Space Rescue', icon: 'rocket_launch', color: 'bg-orange-500', shadow: 'shadow-orange-700', ring: 'ring-orange-400/50', desc: 'Use advanced conditionals for survival.', question: 'Program your starship! If the energy shield drops below 20%, trigger the emergency recharge!', x: 90, y: 60 },
];

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<typeof GAMES_PATH[0] | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col relative overflow-hidden font-sans">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-50 dark:via-[#09090b] to-slate-50 dark:to-[#09090b]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 dark:opacity-30 mix-blend-overlay dark:mix-blend-screen"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '11s' }}></div>
      </div>

      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/learning" className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white transition-all border border-slate-300 dark:border-white/10">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400">explore</span> Coding Adventures
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Master Logic & Algorithms</p>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex items-center justify-center relative min-h-[700px] overflow-x-auto hide-scrollbar">
        <div className="relative w-[1200px] md:w-full aspect-[21/9] mx-auto z-10">

          <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 10 40 C 15 60, 20 70, 25 70 C 35 70, 35 50, 45 50 C 50 50, 55 20, 60 20 C 70 20, 75 40, 80 40 C 85 40, 75 80, 70 80 C 65 80, 85 60, 90 60" fill="none" className="stroke-indigo-200 dark:stroke-indigo-900/40" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 10 40 C 15 60, 20 70, 25 70 C 35 70, 35 50, 45 50 C 50 50, 55 20, 60 20 C 70 20, 75 40, 80 40 C 85 40, 75 80, 70 80 C 65 80, 85 60, 90 60" fill="none" className="stroke-indigo-600 dark:stroke-indigo-400 animate-[dash_40s_linear_infinite]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 8" />
          </svg>

          {GAMES_PATH.map((game, i) => (
            <div key={game.id} className="absolute flex flex-col items-center justify-center group -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 hover:z-50" style={{ left: `${game.x}%`, top: `${game.y}%` }} onClick={() => setSelectedGame(game)}>
              <div className="relative">
                <div className={`absolute inset-0 rounded-full ring-4 ${game.ring} scale-[1.3] opacity-0 group-hover:animate-ping`}></div>
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${game.color} border-[6px] border-slate-50 dark:border-[#09090b] shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-300 relative z-10 overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,_white,_transparent_60%)]"></div>
                  <span className="material-symbols-outlined text-4xl md:text-5xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] relative z-20">{game.icon}</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-white font-black text-sm z-30 shadow-lg">{i + 1}</div>
              </div>
              <div className="mt-4 text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest bg-white/80 dark:bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-xl border border-slate-200 dark:border-white/20 shadow-xl transition-transform group-hover:-translate-y-1">{game.title}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedGame && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedGame(null)}>
          <div className="bg-white dark:bg-[#13131a] rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedGame(null)} className="absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 border-2 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:border-white/10 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined font-bold">close</span>
            </button>
            <div className={`w-32 h-32 rounded-full ${selectedGame.color} border-8 border-slate-50 dark:border-[#09090b] shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center text-white mx-auto -mt-16 mb-6 relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_30%,_white,_transparent_60%)]"></div>
              <span className="material-symbols-outlined text-6xl drop-shadow-md relative z-10">{selectedGame.icon}</span>
            </div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">{selectedGame.title}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{selectedGame.desc}</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-2xl mb-8 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${selectedGame.color}`}></div>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-2">{selectedGame.question}</p>
            </div>
            <button onClick={() => router.push(`/learning/games/${selectedGame.id}`)} className={`w-full py-4 rounded-xl ${selectedGame.color} hover:brightness-110 text-white font-black text-lg uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all`}>
              Start Mission
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

===================================================================== */
