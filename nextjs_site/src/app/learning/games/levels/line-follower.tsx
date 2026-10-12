import React from 'react';
import { GameState, LevelConfig } from '../engine/types';
import { motion } from 'framer-motion';

const LineFollowerScene = ({ state }: { state: GameState }) => {
  const progress = state.progress ?? 0;
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden">
      
      {/* Floor Grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_black_1px,_transparent_1px)] bg-[size:20px_20px]"></div>

      {/* The curved track (SVG) */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
         <path 
           d="M 50 90 C 50 60, 20 60, 20 40 C 20 20, 80 20, 80 40 C 80 60, 50 60, 50 10" 
           fill="none" 
           stroke="#1e293b" 
           strokeWidth="8" 
           strokeLinecap="round" 
         />
      </svg>

      {/* The Robot */}
      <motion.div 
        className="absolute w-12 h-12 bg-white rounded-full shadow-xl border-4 border-indigo-500 flex flex-col items-center justify-center z-20"
        style={{
          offsetPath: 'path("M 50 90 C 50 60, 20 60, 20 40 C 20 20, 80 20, 80 40 C 80 60, 50 60, 50 10")',
          offsetDistance: `${progress}%`
        }}
        animate={{ offsetDistance: `${progress}%` }}
        transition={{ type: "tween", ease: "linear", duration: 0.5 }}
      >
         {/* IR Sensors */}
         <div className="absolute -top-1 flex gap-2">
            <div className={`w-2 h-2 rounded-full ${progress < 100 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-slate-400'}`}></div>
            <div className={`w-2 h-2 rounded-full ${progress < 100 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-slate-400'}`}></div>
         </div>
         <span className="material-symbols-outlined text-indigo-500">smart_toy</span>
      </motion.div>

      {/* Win/Lose Text */}
      {state.text && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
           <span className={`text-4xl font-black drop-shadow-2xl animate-bounce ${state.text === 'WIN' ? 'text-emerald-400' : 'text-red-400'}`}>
             {state.text}
           </span>
        </div>
      )}
    </div>
  );
};

export const lineFollowerLevel: LevelConfig = {
  id: 'line-follower',
  title: 'Line Follower',
  icon: 'route',
  color: 'bg-indigo-500',
  simBg: 'bg-slate-800',
  concept: 'While Loops and IR Sensors',
  mission: 'The robot needs to follow the curved track! Use a while loop to keep moving forward as long as it is on the line.',
  question: 'Use a WHILE loop. Check if the IR sensor says "onLine", and if so, move forward!',
  startXml: '<xml><block type="controls_whileUntil" x="40" y="40"><field name="MODE">WHILE</field></block></xml>',
  solutionXml: '<xml><block type="controls_whileUntil" x="40" y="40"><field name="MODE">WHILE</field><value name="BOOL"><block type="sensor_online"></block></value><statement name="DO"><block type="action_move_forward"></block></statement></block></xml>',
  solutions: { 
    javascript: `while (isOnLine()) {\n  await moveForward();\n}`, 
    python: `while isOnLine():\n    moveForward()`, 
    java: `while (isOnLine()) {\n    moveForward();\n}`, 
    cpp: `while (isOnLine()) {\n    moveForward();\n}` 
  },
  toolbox: { 
    kind: 'categoryToolbox', 
    contents: [
      { kind: 'category', name: 'Loops', colour: '120', contents: [{ kind: 'block', type: 'controls_whileUntil' }] }, 
      { kind: 'category', name: 'Sensors', colour: '330', contents: [{ kind: 'block', type: 'sensor_online' }] }, 
      { kind: 'category', name: 'Actuators', colour: '290', contents: [{ kind: 'block', type: 'action_move_forward' }] }
    ] 
  },
  maxBlocksForThreeStars: 3,
  hints: ['Use the WHILE block.', 'Put the onLine sensor in the condition slot.', 'Put the Move Forward block inside the loop.'],
  successStory: 'Awesome! Automated guided vehicles (AGVs) in Amazon warehouses use this exact logic to follow tape on the floor.',
  Scene: LineFollowerScene,
  init: () => ({ x: 0, y: 0, rotation: 0, scale: 1, text: '', active: false, progress: 0 }),
  api: (getState, updateState, delay) => ({
    isOnLine: async () => {
      await delay(100);
      return getState().progress < 100;
    },
    moveForward: async () => {
      const p = getState().progress;
      if (p < 100) {
        updateState({ progress: p + 10 });
        await delay(300);
        if (p + 10 >= 100) {
          updateState({ text: 'WIN' });
        }
      }
    }
  }),
  check: (state, blockCount) => {
    if (state.progress >= 100) {
      return { passed: true, message: 'Robot reached the end of the line!', stars: blockCount <= 3 ? 3 : 2 };
    } else {
      return { passed: false, message: 'The robot stopped too early. Use a loop to keep it moving!', stars: 0 };
    }
  }
};
