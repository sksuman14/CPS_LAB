import React from 'react';
import { GameState, LevelConfig } from '../engine/types';
import { motion, AnimatePresence } from 'framer-motion';

const SmartGreenhouseScene = ({ state }: { state: GameState }) => {
  const moisture = state.moisture ?? 50;
  const isPumpOn = state.pumpOn ?? false;
  
  // Visual representation
  const plantHeight = Math.max(20, Math.min(100, moisture * 1.5));
  const plantColor = moisture < 30 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end pb-8 bg-slate-900 rounded-2xl overflow-hidden">
      {/* Moisture Sensor Display */}
      <div className="absolute top-4 left-4 bg-slate-800/80 p-3 rounded-xl border border-slate-600 flex flex-col items-center z-20">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Moisture</span>
        <div className="text-2xl font-black text-white">{Math.round(moisture)}%</div>
      </div>

      {/* Water Pump */}
      <div className={`absolute top-4 right-4 p-3 rounded-xl border flex flex-col items-center transition-colors z-20 ${isPumpOn ? 'bg-blue-500/20 border-blue-500' : 'bg-slate-800/80 border-slate-600'}`}>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Pump</span>
        <span className={`material-symbols-outlined text-3xl ${isPumpOn ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`}>
          water_drop
        </span>
      </div>

      {/* Plant Animation */}
      <div className="relative w-32 flex flex-col items-center justify-end h-[150px] z-10">
        <motion.div 
          className="absolute inset-0 flex items-end justify-center"
          animate={{ height: `${plantHeight}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        >
          <span className={`material-symbols-outlined text-9xl ${plantColor} transition-colors duration-1000`}>
            local_florist
          </span>
        </motion.div>
      </div>
      
      {/* Soil */}
      <div className="w-[80%] h-12 bg-amber-900 rounded-t-3xl border-t-4 border-amber-800 relative overflow-hidden z-10">
        {/* Animated Water Level in Soil */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 bg-blue-500/30"
          animate={{ height: `${moisture}%` }}
          transition={{ type: "spring" }}
        />
      </div>

      {/* Rain / Water droplets effect when pump is ON */}
      <AnimatePresence>
        {isPumpOn && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none flex justify-center pt-20 z-0"
          >
             <div className="w-32 flex justify-between px-4">
                {[1,2,3].map(i => (
                  <motion.div 
                    key={i}
                    className="w-1 h-3 bg-blue-400 rounded-full"
                    animate={{ y: [0, 100], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.2 }}
                  />
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

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

export const smartGreenhouseLevel: LevelConfig = {
  id: 'smart-greenhouse',
  title: 'Smart Greenhouse',
  icon: 'grass',
  color: 'bg-emerald-500',
  simBg: 'bg-slate-900',
  concept: 'Sensors and Conditionals',
  mission: 'The plant is too dry! If the soil moisture is below 30%, turn on the water pump.',
  question: 'Check the soil moisture sensor. If it drops below 30, activate the pump to save the plant!',
  startXml: '<xml><block type="controls_if" x="40" y="40"></block></xml>',
  solutionXml: '<xml><block type="controls_if" x="40" y="40"><value name="IF0"><block type="logic_compare"><field name="OP">LT</field><value name="A"><block type="sensor_moisture"></block></value><value name="B"><shadow type="math_number"><field name="NUM">30</field></shadow></value></block></value><statement name="DO0"><block type="action_pump"><field name="STATE">ON</field></block></statement></block></xml>',
  solutions: { 
    javascript: `if (getMoisture() < 30) {\n  setPump(true);\n}`, 
    python: `if getMoisture() < 30:\n    setPump(True)`, 
    java: `if (getMoisture() < 30) {\n    setPump(true);\n}`, 
    cpp: `if (getMoisture() < 30) {\n    setPump(true);\n}` 
  },
  toolbox: { 
    kind: 'categoryToolbox', 
    contents: [
      { kind: 'category', name: 'Logic', colour: '210', contents: [{ kind: 'block', type: 'controls_if' }, { kind: 'block', type: 'logic_compare' }] }, 
      { kind: 'category', name: 'Sensors', colour: '330', contents: [{ kind: 'block', type: 'sensor_moisture' }] }, 
      { kind: 'category', name: 'Actuators', colour: '290', contents: [{ kind: 'block', type: 'action_pump' }] },
      { kind: 'category', name: 'Math', colour: '230', contents: [{ kind: 'block', type: 'math_number' }] }
    ] 
  },
  maxBlocksForThreeStars: 4,
  hints: ['Use the IF block to check a condition.', 'Compare the moisture sensor to the number 30.', 'Put the Pump block inside the IF block.'],
  successStory: 'You saved the plant! In real greenhouses, automated sensors like this save millions of gallons of water every year.',
  Scene: SmartGreenhouseScene,
  init: () => ({ x: 0, y: 0, rotation: 0, scale: 1, text: '', active: false, moisture: 20, pumpOn: false }),
  api: (getState, updateState, delay) => ({
    getMoisture: async () => {
      await delay(500);
      return getState().moisture;
    },
    setPump: async (state: boolean) => {
      updateState({ pumpOn: state });
      await delay(1000);
      if (state) {
        updateState({ moisture: 80, text: 'WIN' });
      } else {
        updateState({ text: 'CRASH' });
      }
    }
  }),
  check: (state, blockCount) => {
    if (state.moisture >= 50) {
      return { passed: true, message: 'Plant is watered and happy!', stars: blockCount <= 4 ? 3 : 2 };
    } else {
      return { passed: false, message: 'The plant dried up! Make sure you turn on the pump when moisture is low.', stars: 0 };
    }
  }
};
