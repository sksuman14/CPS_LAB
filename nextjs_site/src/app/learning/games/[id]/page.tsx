'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BlocklyEditor from '../../block-coding/components/BlocklyEditor';
import Link from 'next/link';

const GAMES_DATA = {
  'robot-puzzle': { 
    title: 'Robot Assembly', icon: 'smart_toy', color: 'bg-emerald-500', simBg: 'bg-slate-900', simEntity: 'smart_toy',
    question: 'Connect the logic blocks together in the workspace to activate your AI robot buddy!',
    startXml: '<xml><block type="controls_if" x="40" y="40"></block></xml>',
    solutionXml: '<xml><block type="controls_if" x="40" y="40"><value name="IF0"><block type="game_condition"><field name="CONDITION">partsConnected</field></block></value><statement name="DO0"><block type="game_action"><field name="ACTION">activateRobot</field></block></statement></block></xml>',
    solutions: { javascript: `if (partsConnected) {\n  activateRobot();\n}`, python: `if partsConnected:\n    activateRobot()`, java: `if (partsConnected) {\n    activateRobot();\n}`, cpp: `if (partsConnected) {\n    activateRobot();\n}` },
    toolbox: { kind: 'categoryToolbox', contents: [{ kind: 'category', name: 'Logic', colour: '210', contents: [{ kind: 'block', type: 'controls_if' }, { kind: 'block', type: 'game_condition' }] }, { kind: 'category', name: 'Action', colour: '290', contents: [{ kind: 'block', type: 'game_action' }] }] }
  },
  'drone': { 
    title: 'Drone Navigation', icon: 'flight_takeoff', color: 'bg-sky-500', simBg: 'bg-sky-900', simEntity: 'flight_takeoff',
    question: "Program the drone's flight path! Set the correct angle heading, and use an IF/ELSE block to fly high over obstacles.",
    startXml: '<xml><block type="game_turn" x="40" y="40"><field name="DEG">90</field></block></xml>',
    solutionXml: '<xml><block type="game_turn" x="40" y="40"><field name="DEG">45</field><next><block type="controls_if"><mutation else="1"></mutation><value name="IF0"><block type="game_condition"><field name="CONDITION">obstacleDetected</field></block></value><statement name="DO0"><block type="game_action"><field name="ACTION">flyHigh</field></block></statement><statement name="ELSE"><block type="game_action"><field name="ACTION">flyLow</field></block></statement></block></next></block></xml>',
    solutions: { javascript: `setHeading(45);\nif (obstacleDetected) {\n  flyHigh();\n} else {\n  flyLow();\n}`, python: `setHeading(45)\nif obstacleDetected:\n    flyHigh()\nelse:\n    flyLow()`, java: `setHeading(45);\nif (obstacleDetected) {\n    flyHigh();\n} else {\n    flyLow();\n}`, cpp: `setHeading(45);\nif (obstacleDetected) {\n    flyHigh();\n} else {\n    flyLow();\n}` },
    toolbox: { kind: 'categoryToolbox', contents: [{ kind: 'category', name: 'Logic', colour: '210', contents: [{ kind: 'block', type: 'controls_if' }, { kind: 'block', type: 'game_condition' }] }, { kind: 'category', name: 'Action', colour: '290', contents: [{ kind: 'block', type: 'game_action' }, { kind: 'block', type: 'game_turn' }] }] }
  },
  'plotter': { 
    title: 'Plotter Bot', icon: 'precision_manufacturing', color: 'bg-indigo-500', simBg: 'bg-indigo-900', simEntity: 'precision_manufacturing',
    question: "Draw a glowing star! Use a repeat loop to move the robotic pen forward and turn right 144 degrees, 5 times in a row.",
    startXml: '<xml><block type="controls_repeat_ext" x="40" y="40"><value name="TIMES"><shadow type="math_number"><field name="NUM">5</field></shadow></value></block></xml>',
    solutionXml: '<xml><block type="controls_repeat_ext" x="40" y="40"><value name="TIMES"><shadow type="math_number"><field name="NUM">5</field></shadow></value><statement name="DO"><block type="game_move"><field name="DIST">50</field><next><block type="game_turn"><field name="DEG">144</field></block></next></block></statement></block></xml>',
    solutions: { javascript: `for (let count = 0; count < 5; count++) {\n  moveForward(50);\n  turnRight(144);\n}`, python: `for count in range(5):\n    moveForward(50)\n    turnRight(144)`, java: `for (int count = 0; count < 5; count++) {\n    moveForward(50);\n    turnRight(144);\n}`, cpp: `for (int count = 0; count < 5; count++) {\n    moveForward(50);\n    turnRight(144);\n}` },
    toolbox: { kind: 'categoryToolbox', contents: [{ kind: 'category', name: 'Plotter', colour: '160', contents: [{ kind: 'block', type: 'game_move' }, { kind: 'block', type: 'game_turn' }] }, { kind: 'category', name: 'Loops', colour: '120', contents: [{ kind: 'block', type: 'controls_repeat_ext' }] }, { kind: 'category', name: 'Math', colour: '230', contents: [{ kind: 'block', type: 'math_number' }] }] }
  },
  'rocket-anim': { 
    title: 'Rocket Launch', icon: 'rocket', color: 'bg-purple-500', simBg: 'bg-slate-900', simEntity: 'rocket',
    question: "Launch the rocket! Use a repeat loop to trigger the 'Engage Thrust' action 5 times to escape gravity!",
    startXml: '<xml><block type="controls_repeat_ext" x="40" y="40"><value name="TIMES"><shadow type="math_number"><field name="NUM">5</field></shadow></value></block></xml>',
    solutionXml: '<xml><block type="controls_repeat_ext" x="40" y="40"><value name="TIMES"><shadow type="math_number"><field name="NUM">5</field></shadow></value><statement name="DO"><block type="game_action"><field name="ACTION">thrust</field></block></statement></block></xml>',
    solutions: { javascript: `for (let count = 0; count < 5; count++) {
  thrust();
  await wait(500);
}`, python: `for count in range(5):
    thrust()
    wait(500)`, java: `for (int count = 0; count < 5; count++) {
    thrust();
    wait(500);
}`, cpp: `for (int count = 0; count < 5; count++) {
    thrust();
    wait(500);
}` },
    toolbox: { kind: 'categoryToolbox', contents: [{ kind: 'category', name: 'Action', colour: '290', contents: [{ kind: 'block', type: 'game_action' }] }, { kind: 'category', name: 'Loops', colour: '120', contents: [{ kind: 'block', type: 'controls_repeat_ext' }] }, { kind: 'category', name: 'Math', colour: '230', contents: [{ kind: 'block', type: 'math_number' }] }] }
  },
  'traffic-light': { 
    title: 'Traffic Control', icon: 'traffic', color: 'bg-pink-500', simBg: 'bg-slate-900', simEntity: 'traffic',
    question: "Manage the city intersection! If the timer variable hits 10, change the traffic light to GREEN.",
    startXml: '<xml><block type="controls_if" x="40" y="40"></block></xml>',
    solutionXml: '<xml><block type="controls_if" x="40" y="40"><value name="IF0"><block type="game_condition"><field name="CONDITION">timer == 10</field></block></value><statement name="DO0"><block type="game_action"><field name="ACTION">lightGreen</field></block></statement></block></xml>',
    solutions: { javascript: `if (timer == 10) {\n  lightGreen();\n}`, python: `if timer == 10:\n    lightGreen()`, java: `if (timer == 10) {\n    lightGreen();\n}`, cpp: `if (timer == 10) {\n    lightGreen();\n}` },
    toolbox: { kind: 'categoryToolbox', contents: [{ kind: 'category', name: 'Logic', colour: '210', contents: [{ kind: 'block', type: 'controls_if' }, { kind: 'block', type: 'game_condition' }] }, { kind: 'category', name: 'Action', colour: '290', contents: [{ kind: 'block', type: 'game_action' }] }] }
  },
  'space-rescue': { 
    title: 'Space Rescue', icon: 'rocket_launch', color: 'bg-orange-500', simBg: 'bg-slate-900', simEntity: 'rocket_launch',
    question: "Program your starship! If the energy shield drops below 20%, trigger the emergency recharge!",
    startXml: '<xml><block type="controls_if" x="40" y="40"></block></xml>',
    solutionXml: '<xml><block type="controls_if" x="40" y="40"><value name="IF0"><block type="game_condition"><field name="CONDITION">shield &lt; 20</field></block></value><statement name="DO0"><block type="game_action"><field name="ACTION">recharge</field></block></statement></block></xml>',
    solutions: { javascript: `if (shield < 20) {\n  recharge();\n}`, python: `if shield < 20:\n    recharge()`, java: `if (shield < 20) {\n    recharge();\n}`, cpp: `if (shield < 20) {\n    recharge();\n}` },
    toolbox: { kind: 'categoryToolbox', contents: [{ kind: 'category', name: 'Logic', colour: '210', contents: [{ kind: 'block', type: 'controls_if' }, { kind: 'block', type: 'game_condition' }] }, { kind: 'category', name: 'Action', colour: '290', contents: [{ kind: 'block', type: 'game_action' }] }] }    },
    'maze': {
      title: 'Rover Escape', icon: 'explore', color: 'bg-blue-500', simBg: 'bg-[#1a1a24]', simEntity: 'car',
      question: 'Navigate the smart rover through the grid to reach the checkered flag without hitting any obstacles! (Target: Top Right)',
      startXml: '<xml><block type="car_move" x="40" y="40"><field name="DIRECTION">F</field><field name="DURATION">1</field></block></xml>',
      solutionXml: '<xml><block type="car_move" x="40" y="40"><field name="DIRECTION">F</field><field name="DURATION">2</field><next><block type="car_move"><field name="DIRECTION">R</field><field name="DURATION">2</field><next><block type="car_move"><field name="DIRECTION">F</field><field name="DURATION">2</field><next><block type="car_move"><field name="DIRECTION">R</field><field name="DURATION">2</field></block></next></block></next></block></next></block></xml>',
      solutions: { javascript: `await car.move('Forward', 2);
await car.move('Right', 2);
await car.move('Forward', 2);
await car.move('Right', 2);`, python: `car.move('Forward', 2)
car.move('Right', 2)
car.move('Forward', 2)
car.move('Right', 2)`, java: `car.move("Forward", 2);
car.move("Right", 2);
car.move("Forward", 2);
car.move("Right", 2);`, cpp: `car.move("Forward", 2);
car.move("Right", 2);
car.move("Forward", 2);
car.move("Right", 2);` },
      toolbox: { kind: 'categoryToolbox', contents: [{ kind: 'category', name: 'Car Movement', colour: '230', contents: [{ kind: 'block', type: 'car_move' }, { kind: 'block', type: 'car_stop' }, { kind: 'block', type: 'car_set_speed' }, { kind: 'block', type: 'car_custom_command' }] }, { kind: 'category', name: 'Timing', colour: '120', contents: [{ kind: 'block', type: 'car_wait' }] }, { kind: 'category', name: 'Loops', colour: '120', contents: [{ kind: 'block', type: 'controls_repeat_ext' }] }, { kind: 'category', name: 'Math', colour: '230', contents: [{ kind: 'block', type: 'math_number' }] }] },
      startX: 0,
      startY: 4,
    }
  };



const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function GenericGamePage() {
  const [terminalLog, setTerminalLog] = useState<string[]>(['> System initialized. Waiting for program...']);
  const [showSolution, setShowSolution] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Real-time Visualizer State
  const [simState, setSimState] = useState({ x: 0, y: 0, rotation: 0, scale: 1, text: '', active: false });
  const [currentXml, setCurrentXml] = useState<string | null>(null);
  const [solLang, setSolLang] = useState<'javascript'|'python'|'java'|'cpp'>('javascript');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const router = useRouter();
  const params = useParams();
  
  const gameId = params?.id as keyof typeof GAMES_DATA;
  const game = gameId ? GAMES_DATA[gameId] : null;

  useEffect(() => {
    if (game) {
      setCurrentXml(game.startXml);
    }
  }, [game]);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white flex-col gap-4">
        <h2>Game Not Found: {gameId}</h2>
        <button onClick={() => router.push('/learning/games')} className="px-6 py-3 bg-indigo-500 rounded-xl font-bold">Return to Map</button>
      </div>
    );
  }

  // Handle Real-Time Blockly Code Updates!
  const handleCodeChange = (code: any) => {
    if (!code || !code.javascript) return;
    
    let newRotation = simState.rotation;
    let newScale = simState.scale;

    // React in real-time to Drone Heading
    const headingMatch = code.javascript.match(/turnRight\s*\(\s*(\d+)\s*\)/);
    if (headingMatch) {
       newRotation = parseInt(headingMatch[1], 10);
    }
    
    if (newRotation !== simState.rotation) {
       setSimState(prev => ({ ...prev, rotation: newRotation }));
    }
  };

  const runCode = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    // Reset simulator state before running
    setSimState({ x: (game as any).startX || 0, y: (game as any).startY || 0, rotation: 0, scale: 1, text: '', active: false });
    setTerminalLog(['> Running program...']);
    
    
    try {
      let logs: string[] = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => { logs.push(args.join(' ')); };

      // Engine API
      const mockContext: any = {
        activateRobot: () => {
          console.log("Robot AI activated!");
          setSimState(s => ({ ...s, scale: 1.2, text: 'ðŸ¤– ONLINE' }));
        },
        explode: () => { console.log("Self-destruct sequence initiated!"); setSimState(s => ({ ...s, text: 'ðŸ’¥ BOOM' })); },
        playMusic: () => { console.log("Playing music..."); setSimState(s => ({ ...s, text: 'ðŸŽµ MUSIC' })); },
        partsConnected: true,
        lowBattery: false,
        obstacleDetected: true,
        flyHigh: () => {
          console.log("Drone flying HIGH to avoid obstacle!");
          setSimState(s => ({ ...s, y: -120, scale: 1.5, text: 'Altitude: HIGH' }));
        },
        flyLow: () => {
          console.log("Drone flying LOW.");
          setSimState(s => ({ ...s, y: 50, scale: 0.8, text: 'Altitude: LOW' }));
        },
        moveForward: (dist: number) => {
          console.log(`Plotter moved forward by ${dist}mm`);
          setSimState(s => ({ ...s, x: s.x + (dist/2) }));
        },
        turnRight: (deg: number) => {
          console.log(`Plotter turned right by ${deg}Â°`);
          setSimState(s => ({ ...s, rotation: s.rotation + deg }));
        },
        lightGreen: () => {
          console.log("Traffic Light changed to GREEN.");
          setSimState(s => ({ ...s, scale: 1.1, text: 'ðŸŸ¢ GO', active: true }));
        },
        lightRed: () => { console.log("Traffic Light changed to RED."); setSimState(s => ({ ...s, text: 'ðŸ”´ STOP', active: false })); },
        lightYellow: () => { console.log("Traffic Light changed to YELLOW."); setSimState(s => ({ ...s, text: 'ðŸŸ¡ SLOW', active: false })); },
        timer: 10,
        pedestrian: false,
        recharge: () => {
            console.log("Shield recharge activated!");
            setSimState(s => ({ ...s, scale: 1.2, text: 'SHIELDS UP', active: true }));
          },
          fireLasers: () => { console.log("Lasers fired!"); },
          openHatch: () => { console.log("Hatch opened!"); },
          thrust: () => {
            console.log("Rocket thrust engaged!");
            setSimState(s => ({ ...s, y: s.y - 40, scale: 1.1, text: 'THRUST' }));
          },
          car: {
            move: async (dir: string, duration: number) => {
              let steps = Math.max(1, Math.round(duration));
              for (let i = 0; i < steps; i++) {
                await wait(300);
                let hasCrashed = false;
                setSimState(s => {
                   if (s.text.includes('CRASH') || s.text.includes('WIN')) { hasCrashed = true; return s; }
                   let nx = s.x; let ny = s.y;
                   if (dir === 'Forward') ny -= 1;
                   if (dir === 'Backward') ny += 1;
                   if (dir === 'Left') nx -= 1;
                   if (dir === 'Right') nx += 1;
                   
                   if (nx < 0 || nx >= 5 || ny < 0 || ny >= 5) {
                     console.log("CRASH! Rover hit the boundary.");
                     hasCrashed = true;
                     return { ...s, text: 'CRASH', active: false };
                   }
                   const WALLS = [ { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 3, y: 1 }, { x: 3, y: 0 }, { x: 2, y: 2 } ];
                   if (WALLS.some(w => w.x === nx && w.y === ny)) {
                     console.log("CRASH! Rover hit a wall.");
                     hasCrashed = true;
                     return { ...s, text: 'CRASH', active: false };
                   }
                   if (nx === 4 && ny === 0) {
                     console.log("SUCCESS! Reached target!");
                     hasCrashed = true;
                     return { ...s, x: nx, y: ny, text: 'WIN', active: true, scale: 1.2 };
                   }
                   console.log(`Rover moved ${dir} to [${nx}, ${ny}]`);
                   return { ...s, x: nx, y: ny, active: true };
                });
                if (hasCrashed) break;
              }
            },
            stop: async () => { console.log("Rover stopped."); },
            setSpeed: async (s: number) => { console.log(`Rover speed set to ${s}.`); },
            wait: async (s: number) => { await wait(s * 1000); },
            connect: async () => { console.log("Rover BLE connected."); },
            disconnect: async () => { console.log("Rover BLE disconnected."); },
            sendCommand: async (cmd: string) => { console.log(`Rover command: ${cmd}`); },
          }
        };

        // Inject wait into loops for visualization
        let jsCode = (window as any)._latestJsCode || '';
        
        // Super unsafe but fun evaluation for the educational simulator
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const executable = new AsyncFunction('mockContext', 'wait', `
        with (mockContext) {
          try {
             ${jsCode}
          } catch(e) {
             console.log("Error: " + e.message);
          }
        }
      `);

      await executable(mockContext, wait);

      console.log = originalConsoleLog;
      setTerminalLog(prev => [...prev, ...logs.map(l => `> ${l}`), '> Program executed successfully.']);
    } catch (err: any) {
      setTerminalLog(prev => [...prev, `> Error: ${err.message}`]);
    }
    
    setTimeout(() => setIsSimulating(false), 500);
  };

  // Custom Scene Renderer
  const renderScene = () => {
    if (gameId === 'robot-puzzle') {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
           <div className={`transition-all duration-700 p-4 rounded-xl bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex flex-col items-center shadow-xl ${simState.active ? 'bg-emerald-900 border-emerald-500 scale-110' : 'translate-y-8'}`}>
              <span className="material-symbols-outlined text-5xl text-emerald-400">smart_toy</span>
              <span className="text-slate-900 dark:text-white font-bold mt-2">AI Core</span>
           </div>
           {simState.text && <div className="absolute top-1/4 text-emerald-400 font-black text-2xl drop-shadow-lg animate-bounce">{simState.text}</div>}
        </div>
      );
    }
    
    if (gameId === 'traffic-light') {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
           <div className="w-16 h-32 bg-slate-200 dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-between p-2">
              <div className={`w-8 h-8 rounded-full ${simState.active ? 'bg-slate-700' : 'bg-red-500 shadow-[0_0_20px_red]'}`}></div>
              <div className="w-8 h-8 rounded-full bg-slate-700"></div>
              <div className={`w-8 h-8 rounded-full ${simState.active ? 'bg-green-500 shadow-[0_0_20px_#22c55e]' : 'bg-slate-700'}`}></div>
           </div>
           {simState.text && <div className="absolute bottom-1/4 text-green-400 font-bold animate-pulse text-sm">{simState.text}</div>}
        </div>
      );
    }
    
    if (gameId === 'space-rescue') {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
           <div className={`transition-all duration-500 rounded-full p-4 ${simState.active ? 'bg-blue-500/20 shadow-[0_0_40px_#3b82f6] border-4 border-blue-400' : 'border-4 border-transparent'}`}>
             <div className="p-4 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700">
               <span className="material-symbols-outlined text-5xl text-orange-400">rocket_launch</span>
             </div>
           </div>
           {simState.text && <div className="absolute top-1/4 text-blue-400 font-bold animate-bounce text-sm">{simState.text}</div>}
        </div>
      );
    }
    
    if (gameId === 'rocket-anim') {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-end pb-4">
           {/* Launch Pad */}
           <div className="absolute bottom-0 w-32 h-6 bg-slate-200 dark:bg-slate-800 border-t-4 border-slate-300 dark:border-slate-700 rounded-t-xl z-0"></div>
           {/* The Rocket */}
           <div 
              className="transition-all duration-500 ease-out flex flex-col items-center justify-center relative z-10"
              style={{ transform: `translate(0px, ${simState.y}px) scale(${simState.scale})` }}
            >
               <div className="bg-purple-500 p-4 rounded-full shadow-[0_0_40px_rgba(168,85,247,0.6)] border-4 border-white mb-6">
                 <span className="material-symbols-outlined text-5xl text-slate-900 dark:text-white">rocket</span>
               </div>
               
               {/* Fire/Thrust visual (only when moving) */}
               {simState.y < 0 && <div className="absolute bottom-0 w-4 h-10 bg-gradient-to-t from-transparent via-orange-500 to-yellow-300 rounded-b-full animate-pulse blur-[2px]"></div>}
               
               {simState.text && <div className="absolute top-[100%] whitespace-nowrap bg-purple-900/80 text-purple-300 px-3 py-1 rounded-full text-xs font-bold font-mono mt-4">{simState.text}</div>}
           </div>
        </div>
      );
    }
    
    if (gameId === 'maze') {
      const MAZE_SIZE = 5;
      const TARGET_POS = { x: 4, y: 0 };
      const WALLS = [ { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 3, y: 1 }, { x: 3, y: 0 }, { x: 2, y: 2 } ];
      return (
        <div className="relative w-full max-w-[300px] aspect-square bg-[#0f0f16] rounded-2xl shadow-lg border border-slate-300 dark:border-white/10 overflow-hidden p-2 mx-auto">
          <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 pointer-events-none opacity-10">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="border border-slate-500"></div>
            ))}
          </div>
          <div className="relative w-full h-full">
            {WALLS.map((wall, i) => (
              <div 
                key={i} 
                className="absolute bg-slate-700 rounded-md border-b-4 border-slate-900 flex items-center justify-center text-xl shadow-md"
                style={{ width: '18%', height: '18%', left: `${(wall.x / MAZE_SIZE) * 100 + 1}%`, top: `${(wall.y / MAZE_SIZE) * 100 + 1}%` }}
              >
                <span className="material-symbols-outlined text-red-400">block</span>
              </div>
            ))}
            <div className="absolute flex items-center justify-center text-3xl animate-bounce drop-shadow-md z-10" style={{ width: '20%', height: '20%', left: `${(TARGET_POS.x / MAZE_SIZE) * 100}%`, top: `${(TARGET_POS.y / MAZE_SIZE) * 100}%` }}>
              <span className="material-symbols-outlined text-slate-900 dark:text-white">sports_score</span>
            </div>
            <div 
              className="absolute flex items-center justify-center text-3xl z-20 transition-all duration-300 ease-in-out drop-shadow-xl"
              style={{ width: '20%', height: '20%', left: `${(simState.x / MAZE_SIZE) * 100}%`, top: `${(simState.y / MAZE_SIZE) * 100}%`, transform: `scale(${simState.scale})` }}
            >
              <span className="material-symbols-outlined text-blue-500">directions_car</span>
            </div>
            {simState.text && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/80 px-4 py-2 rounded-xl text-white font-bold animate-in zoom-in">{simState.text}</div>}
          </div>
        </div>
      );
    }

    if (gameId === 'drone') {
      return (
         <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-10 right-20 w-24 h-24 rounded-full border-2 border-dashed border-sky-400/50 animate-[spin_10s_linear_infinite]"></div>
            <div 
              className="transition-all duration-700 ease-in-out flex flex-col items-center justify-center relative z-10"
              style={{ transform: `translate(${simState.x}px, ${simState.y}px) rotate(${simState.rotation}deg) scale(${simState.scale})` }}
            >
               <div className="bg-sky-500 p-3 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.6)] border-2 border-white">
                 <span className="material-symbols-outlined text-4xl text-slate-900 dark:text-white">flight_takeoff</span>
               </div>
               {simState.text && <div className="absolute -bottom-8 whitespace-nowrap bg-sky-900/80 text-[10px] text-sky-300 px-3 py-1 rounded-full font-bold font-mono">{simState.text}</div>}
            </div>
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
               <span className="material-symbols-outlined text-5xl text-red-500/80">landscape</span>
            </div>
         </div>
      );
    }

    return (
      <div 
        className="transition-all duration-500 ease-out flex items-center justify-center relative"
        style={{ transform: `translate(${simState.x}px, ${simState.y}px) rotate(${simState.rotation}deg) scale(${simState.scale})` }}
      >
        <div className={`p-5 rounded-full ${game.color} shadow-xl border-4 border-slate-300 dark:border-white/10 relative`}>
          <span className="material-symbols-outlined text-6xl text-white drop-shadow-md">{game.simEntity}</span>
          
          {simState.text && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-800 px-4 py-2 rounded-2xl font-black shadow-xl whitespace-nowrap animate-bounce border-2 border-slate-200 text-sm">
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-200 rotate-45"></div>
              {simState.text}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <header className="h-16 border-b border-slate-300 dark:border-white/10 flex items-center justify-between px-6 bg-slate-50/80 dark:bg-[#09090b]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <Link href="/learning/games" className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-900 dark:text-white flex items-center justify-center transition-colors border border-slate-300 dark:border-white/10">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${game.color} flex items-center justify-center text-white dark:text-white shadow-lg`}>
              <span className="material-symbols-outlined text-sm">{game.icon}</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">{game.title}</h1>
          </div>
        </div>
        
        <button 
          onClick={() => setShowSolution(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-sm transition-colors border border-amber-500/20"
        >
          <span className="material-symbols-outlined text-lg">lightbulb</span> Solution Hint
        </button>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Simulator & Console */}
        <div className="w-[30%] min-w-[320px] flex flex-col border-r border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#09090b]">
          
          {/* Left Panel Content */}
          <div className="p-4 flex flex-col gap-4 bg-slate-50 dark:bg-[#09090b] flex-shrink-0">
            
            {/* Mission Card */}
            <div className="bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 p-4 rounded-2xl shadow-lg flex-shrink-0">
               <h3 className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 font-bold mb-1 flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm">flag</span> Mission
               </h3>
               <p className="text-sm font-medium text-slate-900 dark:text-white">{game.question}</p>
            </div>

            {/* Animation / Simulator Card */}
            <div className={`w-full aspect-video min-h-[250px] rounded-3xl relative overflow-hidden flex-shrink-0 shadow-2xl border-4 border-slate-200 dark:border-[#13131a] ${game.simBg} flex items-center justify-center`}>
               {renderScene()}
            </div>
            
          </div>



          {/* Terminal / Console */}
          <div className="flex-1 bg-slate-100 dark:bg-[#0a0a0a] flex flex-col border-t border-slate-300 dark:border-white/5 min-h-[200px]">
            <div className="px-4 py-2 border-b border-slate-300 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">terminal</span> Output Console
                </div>
                <button 
                  onClick={runCode}
                  disabled={isSimulating}
                  title="Run Program"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isSimulating ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 dark:text-white'}`}
                >
                  {isSimulating ? <span className="material-symbols-outlined animate-spin text-sm">refresh</span> : <span className="material-symbols-outlined text-sm">play_arrow</span>}
                </button>
              </div>
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar flex flex-col gap-1">
              {terminalLog.map((log, i) => (
                <div key={i} className={`${log.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{log}</div>
              ))}
            </div>
            
          </div>
        </div>

        {/* Right Side: Blockly Workspace */}
        <div className="w-[70%] relative overflow-hidden">
          {/* Solution Overlay Modal - Now on the right side */}
          {showSolution && (
            <div className="absolute top-4 right-4 z-50 w-[450px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-slate-300 dark:border-slate-700 animate-in slide-in-from-right-8">
              <div className="text-amber-600 dark:text-amber-400 mb-4 flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-4 font-bold text-lg">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined">lightbulb</span> Solution Reference</span>
                <button onClick={() => setShowSolution(false)} className="text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:text-white w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800"><span className="material-symbols-outlined text-sm">close</span></button>
              </div>
              
              <div className="flex gap-2 mb-4">
                <button onClick={() => setSolLang('javascript')} className={`px-3 py-1.5 rounded-lg text-xs uppercase font-bold transition-colors ${solLang === 'javascript' ? 'bg-amber-500 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>JS</button>
                <button onClick={() => setSolLang('python')} className={`px-3 py-1.5 rounded-lg text-xs uppercase font-bold transition-colors ${solLang === 'python' ? 'bg-amber-500 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Python</button>
                <button onClick={() => setSolLang('java')} className={`px-3 py-1.5 rounded-lg text-xs uppercase font-bold transition-colors ${solLang === 'java' ? 'bg-amber-500 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Java</button>
                <button onClick={() => setSolLang('cpp')} className={`px-3 py-1.5 rounded-lg text-xs uppercase font-bold transition-colors ${solLang === 'cpp' ? 'bg-amber-500 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>C/C++</button>
              </div>

              <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-300 dark:border-slate-800 mb-4 h-48 overflow-y-auto custom-scrollbar">
                 <pre className="font-mono text-sky-700 dark:text-sky-400 whitespace-pre-wrap text-sm">{game.solutions[solLang]}</pre>
              </div>

              <button 
                onClick={() => {
                  setCurrentXml(game.solutionXml);
                  setShowSolution(false);
                }}
                className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span className="material-symbols-outlined">extension</span> Auto-Solve Blocks
              </button>
            </div>
          )}
          
          <BlocklyEditor 
            key={(currentXml || 'default') + refreshKey}
            gameId={gameId as string}
            toolbox={game.toolbox}
            exampleXml={currentXml}
            onCodeChange={(code) => {
              (window as any)._latestJsCode = code.javascript;
              handleCodeChange(code);
            }}
          />
        </div>
      </div>
    </div>
  );
}

