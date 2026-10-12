'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getProgress, resetProgress, type ProgressData } from './engine/progression';
import { useAuth } from '@/context/AuthContext';
import { setPostLoginRedirect } from '@/lib/auth';

const GAMES_PATH = [
  { id: 'robot-puzzle', title: 'Robot Assembly', icon: 'smart_toy', color: 'bg-emerald-500', shadow: 'shadow-emerald-700', ring: 'ring-emerald-400/50', desc: 'Introduction to logic and snapping blocks together.', question: 'Connect the correct logic and action blocks together in the workspace to activate your AI robot buddy!', x: 10, y: 40 },
  { id: 'maze', title: 'Rover Escape', icon: 'explore', color: 'bg-blue-500', shadow: 'shadow-blue-700', ring: 'ring-blue-400/50', desc: 'Help the robotic rover escape the testing grid!', question: 'Navigate the smart rover through the grid to reach the checkered flag without hitting any obstacles!', x: 20, y: 70 },
  { id: 'drone', title: 'Drone Navigation', icon: 'flight_takeoff', color: 'bg-yellow-500', shadow: 'shadow-yellow-700', ring: 'ring-yellow-400/50', desc: 'Dive into control-flow and headings.', question: "Program the drone's flight path! Set the correct angle heading, and use an IF/ELSE block to fly high over obstacles.", x: 30, y: 50 },
  { id: 'plotter', title: 'Plotter Bot', icon: 'precision_manufacturing', color: 'bg-indigo-500', shadow: 'shadow-indigo-700', ring: 'ring-indigo-400/50', desc: 'Use nested loops to program a robotic drawing arm.', question: 'Draw a glowing star! Use a repeat loop to move the robotic pen forward and turn right 144 degrees, 5 times in a row.', x: 40, y: 20 },
  { id: 'rocket-anim', title: 'Rocket Launch', icon: 'rocket', color: 'bg-purple-500', shadow: 'shadow-purple-700', ring: 'ring-purple-400/50', desc: 'Use math to animate objects on screen.', question: "Animate the rocket launch! Create a mathematical equation block that increases the rocket's height as time increases.", x: 50, y: 60 },
  { id: 'traffic-light', title: 'Traffic Control', icon: 'traffic', color: 'bg-pink-500', shadow: 'shadow-pink-700', ring: 'ring-pink-400/50', desc: 'Automate city infrastructure using variables.', question: 'Manage the city intersection! If the timer variable hits 10, change the traffic light to GREEN.', x: 60, y: 80 },
  { id: 'space-rescue', title: 'Space Rescue', icon: 'rocket_launch', color: 'bg-orange-500', shadow: 'shadow-orange-700', ring: 'ring-orange-400/50', desc: 'Use advanced conditionals for survival.', question: 'Program your starship! If the energy shield drops below 20%, trigger the emergency recharge!', x: 70, y: 50 },
  { id: 'geometry-artist', title: 'Geometry Artist', icon: 'draw', color: 'bg-cyan-600', shadow: 'shadow-cyan-800', ring: 'ring-cyan-400/50', desc: 'Combine loops to draw complex geometric shapes.', question: 'Draw a triangle using loops! Repeat 3 times: Move the pen forward, then turn right by 120 degrees.', x: 85, y: 30 },
];

export default function GamesPage() {
  const { user, googleUser, isLoading } = useAuth();
  const isLoggedIn = !!user || !!googleUser;

  const [selectedGame, setSelectedGame] = useState<typeof GAMES_PATH[0] | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Generate userKey based on auth state
    let uKey = 'local';
    if (user?.userId) uKey = user.userId;
    else if (googleUser?.email) uKey = googleUser.email;

    const load = () => setProgress(getProgress(uKey));
    load();
    window.addEventListener('focus', load);
    // Also trigger on popstate for client-side nav
    window.addEventListener('popstate', load);
    
    // Set up an interval just to be absolutely sure when returning via Next.js router cache
    const interval = setInterval(load, 1000);

    return () => {
       window.removeEventListener('focus', load);
       window.removeEventListener('popstate', load);
       clearInterval(interval);
    };
  }, [user, googleUser]);

  const playerLevel = progress?.global?.level || 1;
  const xpPercent = progress ? (progress.global.xp % 500) / 5 : 0; // 500 XP per level

  return (
    <div className="min-h-screen bg-[#050510] flex flex-col relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#050510]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 mix-blend-screen"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-900/10 to-transparent blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[800px] h-[800px] bg-rose-700/10 rounded-full blur-[150px] mix-blend-screen"></div>
      </div>

      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050510]/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/learning" className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 hover:border-white/20 group">
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center gap-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <span className="material-symbols-outlined text-cyan-400">rocket_launch</span> Cosmic Coding
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <motion.div className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full relative" initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }}></motion.div>
              </div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest drop-shadow-md">Lvl {playerLevel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('Abandon mission and restart from Level 1? Your stars and XP will be reset.')) {
                let uKey = 'local';
                if (user?.userId) uKey = user.userId;
                else if (googleUser?.email) uKey = googleUser.email;
                resetProgress(uKey);
                setProgress(getProgress(uKey));
              }
            }}
            className="text-xs px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 hover:border-rose-500/50 transition-all flex items-center gap-2 font-bold uppercase tracking-wider"
            title="Reset Mission Progress"
          >
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>Abort Run</span>
          </button>
        </div>
      </header>

      <div className="flex-1 w-full mx-auto p-4 md:p-8 flex items-center relative min-h-[800px] overflow-x-auto hide-scrollbar">
        <div className="relative min-w-[1800px] aspect-[25/9] mx-auto z-10 py-20">

          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 10 40 C 15 40, 15 70, 20 70 C 25 70, 25 50, 30 50 C 35 50, 35 20, 40 20 C 45 20, 45 60, 50 60 C 55 60, 55 80, 60 80 C 65 80, 65 50, 70 50 C 77.5 50, 77.5 30, 85 30" fill="none" className="stroke-white/5" strokeWidth="8" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 10 40 C 15 40, 15 70, 20 70 C 25 70, 25 50, 30 50 C 35 50, 35 20, 40 20 C 45 20, 45 60, 50 60 C 55 60, 55 80, 60 80 C 65 80, 65 50, 70 50 C 77.5 50, 77.5 30, 85 30" fill="none" className="stroke-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-dash" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="15 15" />
          </svg>

          {GAMES_PATH.map((game, i) => {
            let isUnlocked = i === 0;
            let isCompleted = false;
            let stars = 0;

            if (progress) {
              const levelData = progress.levels[game.id];
              if (levelData) {
                isCompleted = levelData.completed;
                stars = levelData.stars;
              }
              if (i > 0) {
                const prevGame = GAMES_PATH[i - 1];
                isUnlocked = progress.levels[prevGame.id]?.completed || false;
              }
            }

            const isNextUnlocked = isUnlocked && !isCompleted;
            const floatingDelay = i * 0.5;

            return (
              <div 
                key={game.id} 
                className="absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${game.x}%`, top: `${game.y}%` }}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    y: [0, -15, 0],
                  }}
                  transition={{ 
                    scale: { delay: i * 0.1, type: 'spring', stiffness: 200 },
                    opacity: { delay: i * 0.1 },
                    y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: floatingDelay }
                  }}
                  className={`relative flex flex-col items-center justify-center group ${isUnlocked ? 'cursor-pointer hover:z-50' : 'cursor-not-allowed grayscale-[0.8] opacity-60'}`}
                  onClick={() => {
                    if (!isLoggedIn) {
                      const target = `/learning/games/${game.id}`;
                      setPostLoginRedirect(target);
                      router.push('/login?redirect=' + encodeURIComponent(target));
                    } else {
                      const gameIndex = GAMES_PATH.findIndex(g => g.id === game.id);
                      const isLocked = gameIndex > 0 && (!progress || !progress.levels[GAMES_PATH[gameIndex - 1].id]?.completed);
                      if (!isLocked) {
                        setSelectedGame(game);
                      }
                    }
                  }}
                >
                  {/* Next Level Indicator (Player Ship) */}
                  {isNextUnlocked && (
                    <motion.div 
                      className="absolute -top-14 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,1)] z-30"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                      <span className="material-symbols-outlined text-5xl rotate-[135deg]">rocket</span>
                    </motion.div>
                  )}

                  <div className="relative">
                    {/* Glowing aura for unlocked planets */}
                    {isUnlocked && (
                       <div className={`absolute inset-0 rounded-full ${game.ring} scale-[1.6] opacity-0 blur-md ${isNextUnlocked ? 'animate-pulse opacity-100' : 'group-hover:opacity-60 transition-opacity duration-500'}`}></div>
                    )}
                    
                    {/* The Planet itself */}
                    <motion.div 
                      whileHover={isUnlocked ? { scale: 1.15 } : {}}
                      whileTap={isUnlocked ? { scale: 0.95 } : {}}
                      className={`w-20 h-20 md:w-28 md:h-28 rounded-full ${isUnlocked ? game.color : 'bg-slate-800'} border-4 ${isUnlocked ? 'border-white/20' : 'border-slate-700'} shadow-[inset_0_-15px_30px_rgba(0,0,0,0.5),0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all duration-300 relative z-20 overflow-hidden group-hover:border-white/50`}
                    >
                      {/* Planet atmospheric glow */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.4),_transparent_60%)]"></div>
                      
                      {isUnlocked ? (
                        <span className="material-symbols-outlined text-4xl md:text-5xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] relative z-20">{game.icon}</span>
                      ) : (
                        <span className="material-symbols-outlined text-4xl md:text-5xl text-white/30 relative z-20">lock</span>
                      )}
                    </motion.div>
                    
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border-2 border-white/20 flex items-center justify-center text-white font-black text-sm z-30 shadow-[0_0_15px_rgba(0,0,0,1)]">{i + 1}</div>
                  </div>
                  
                  {isCompleted && (
                    <div className="flex gap-1 mt-3 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                      {[1, 2, 3].map(s => (
                        <span key={s} className={`material-symbols-outlined text-sm ${s <= stars ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]' : 'text-white/20'}`}>star</span>
                      ))}
                    </div>
                  )}
                  
                  <div className={`mt-3 text-sm font-black uppercase tracking-widest bg-slate-900/80 backdrop-blur-xl px-5 py-2 rounded-xl border border-white/10 shadow-2xl transition-transform ${isUnlocked ? 'text-white group-hover:-translate-y-2' : 'text-slate-500'}`}>
                    {game.title}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>


      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-[#0f172a]/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] relative border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setSelectedGame(null)} className="absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-white border-2 border-white/20 hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all shadow-xl">
                <span className="material-symbols-outlined font-bold">close</span>
              </button>
              <div className={`w-32 h-32 rounded-full ${selectedGame.color} border-4 border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center text-white mx-auto -mt-16 mb-6 relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,_white,_transparent_60%)]"></div>
                <span className="material-symbols-outlined text-6xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] relative z-10">{selectedGame.icon}</span>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest drop-shadow-md">{selectedGame.title}</h2>
                <p className="text-slate-400 font-medium">{selectedGame.desc}</p>
                
                {(() => {
                  const gameIndex = GAMES_PATH.findIndex(g => g.id === selectedGame.id);
                  const isLocked = gameIndex > 0 && (!progress || !progress.levels[GAMES_PATH[gameIndex - 1].id]?.completed);
                  const levelData = progress?.levels[selectedGame.id];
                  
                  if (isLocked) {
                    return (
                      <div className="flex items-center justify-center gap-2 mt-4 text-rose-400 bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20">
                        <span className="material-symbols-outlined">lock</span>
                        <span className="font-bold text-sm uppercase tracking-wider">Complete previous mission to unlock</span>
                      </div>
                    );
                  }
                  
                  if (levelData?.completed) {
                    return (
                      <div className="flex justify-center gap-1 mt-4">
                        {[1, 2, 3].map(s => (
                          <span key={s} className={`material-symbols-outlined text-2xl ${s <= levelData.stars ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-slate-700'}`}>star</span>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-8 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${selectedGame.color}`}></div>
                <p className="text-sm text-slate-300 font-medium leading-relaxed pl-2">{selectedGame.question}</p>
              </div>
              {(() => {
                const gameIndex = GAMES_PATH.findIndex(g => g.id === selectedGame.id);
                const isLocked = gameIndex > 0 && (!progress || !progress.levels[GAMES_PATH[gameIndex - 1].id]?.completed);
                return (
                  <button
                    disabled={isLocked || isLoading}
                    onClick={() => {
                      if (!isLoggedIn) {
                        const target = `/learning/games/${selectedGame.id}`;
                        setPostLoginRedirect(target);
                        router.push('/login?redirect=' + encodeURIComponent(target));
                      } else {
                        router.push(`/learning/games/${selectedGame.id}`);
                      }
                    }}
                    className={`w-full py-4 rounded-xl ${isLocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : `${selectedGame.color} hover:brightness-110 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1 active:translate-y-0`} font-black text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10`}
                  >
                    {isLocked ? <><span className="material-symbols-outlined">lock</span> Locked</> : 'Start Mission'}
                  </button>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
