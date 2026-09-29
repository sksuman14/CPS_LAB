'use client';

import React, { useEffect, useRef, useState } from 'react';


// Helper: generate a sleep/wait function in the output code
export const SLEEP_FUNCTION = `
async function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
`;

// ─── Toolbox Definition ─────────────────────────────────────────
const TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Car Movement',
      colour: '230',
      contents: [
        { kind: 'block', type: 'car_move' },
        { kind: 'block', type: 'car_stop' },
        { kind: 'block', type: 'car_set_speed' },
        { kind: 'block', type: 'car_custom_command' },
      ],
    },
    {
      kind: 'category',
      name: 'Timing',
      colour: '120',
      contents: [{ kind: 'block', type: 'car_wait' }],
    },
    {
      kind: 'category',
      name: 'Connection',
      colour: '290',
      contents: [
        { kind: 'block', type: 'car_connect' },
        { kind: 'block', type: 'car_disconnect' },
      ],
    },
    {
      kind: 'category',
      name: 'Loops',
      colour: '120',
      contents: [
        {
          kind: 'block',
          type: 'controls_repeat_ext',
          inputs: {
            TIMES: {
              shadow: { type: 'math_number', fields: { NUM: 4 } },
            },
          },
        },
        { kind: 'block', type: 'controls_whileUntil' },
      ],
    },
    {
      kind: 'category',
      name: 'Logic',
      colour: '210',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_boolean' },
      ],
    },
    {
      kind: 'category',
      name: 'Math',
      colour: '230',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_random_int' },
      ],
    },
    {
      kind: 'category',
      name: 'Variables',
      colour: '330',
      custom: 'VARIABLE',
    },
  ],
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export type CodeLanguages = {
  javascript: string;
  python: string;
  cpp: string;
  java: string;
};

interface BlocklyEditorProps {
  onCodeChange: (code: CodeLanguages) => void;
  onWorkspaceReady?: (workspace: any) => void;
  exampleXml?: string | null;
  toolbox?: any;
  gameId?: string;
}

export default function BlocklyEditor({
  onCodeChange,
  onWorkspaceReady,
  exampleXml,
  toolbox,
  gameId,
}: BlocklyEditorProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const generatorsRegistered = useRef(false);
  const theme = 'dark';

  useEffect(() => {
    if (workspaceRef.current && (window as any).Blockly) {
      const Blockly = (window as any).Blockly;
      const t = theme === 'dark' ? Blockly.Themes.cpsLabThemeDark : Blockly.Themes.cpsLabThemeLight;
      if (t) workspaceRef.current.setTheme(t);
    }
  }, [theme]);

  // Helper to generate all code languages
  const generateAllCode = (workspace: any, Blockly: any) => {
    const javascriptGenerator = Blockly.JavaScript || (window as any).javascript?.javascriptGenerator;
    const pythonGenerator = Blockly.Python || (window as any).python?.pythonGenerator;

    let jsCode = '';
    let pyCode = '';
    
    if (javascriptGenerator) {
      if (!javascriptGenerator.forBlock['game_condition']) {
         console.warn("game_condition generator missing! Re-registering...");
         registerJavascriptGenerators(javascriptGenerator);
      }
      if (pythonGenerator && !pythonGenerator.forBlock['game_condition']) {
         registerPythonGenerators(pythonGenerator);
      }
      jsCode = javascriptGenerator.workspaceToCode(workspace);
    }
    if (pythonGenerator) {
      pyCode = pythonGenerator.workspaceToCode(workspace);
    }

    const fullJs = jsCode;
    const fullPy = pyCode;

    let cppInner = '';
    let javaInner = '';

    if (jsCode) {
      cppInner = jsCode
        .replace(/await car\.move\('/g, 'car.move("')
        .replace(/await car\./g, 'car.')
        .replace(/'\);/g, '");');

      javaInner = jsCode
        .replace(/await car\.move\('/g, 'car.move("')
        .replace(/await car\./g, 'car.')
        .replace(/'\);/g, '");');
    }

    const fullCpp = jsCode
      ? `#include <CarController.h>\n\nCarController car;\n\nvoid setup() {\n  car.begin();\n}\n\nvoid loop() {\n${cppInner
          .split('\n')
          .map((line: string) => '  ' + line)
          .join('\n')}\n}`
      : '';

    const fullJava = jsCode
      ? `import com.cpslab.CarController;\n\npublic class Main {\n  public static void main(String[] args) {\n    CarController car = new CarController();\n\n${javaInner
          .split('\n')
          .map((line: string) => '    ' + line)
          .join('\n')}\n  }\n}`
      : '';

    onCodeChange({
      javascript: fullJs,
      python: fullPy,
      cpp: fullCpp,
      java: fullJava
    });
  };

    useEffect(() => {
    if (isReady && workspaceRef.current && exampleXml) {
      try {
        const Blockly = (window as any).Blockly;
        workspaceRef.current.clear();
        const dom = Blockly.utils.xml.textToDom(exampleXml);
        Blockly.Xml.domToWorkspace(dom, workspaceRef.current);
        
        generateAllCode(workspaceRef.current, Blockly);
      } catch (err) {
        console.error("Failed to load example XML", err);
      }
    }
  }, [exampleXml, isReady]);

  useEffect(() => {
    if (!blocklyDiv.current || workspaceRef.current) return;

    let disposed = false;

    async function initBlockly() {
      try {
        // Load Blockly and multiple generators
        await loadScript('https://unpkg.com/blockly@10.4.3/blockly_compressed.js');
        await loadScript('https://unpkg.com/blockly@10.4.3/blocks_compressed.js');
        await loadScript('https://unpkg.com/blockly@10.4.3/javascript_compressed.js');
        await loadScript('https://unpkg.com/blockly@10.4.3/python_compressed.js');
        await loadScript('https://unpkg.com/blockly@10.4.3/msg/en.js');

        if (disposed) return;

        const Blockly = (window as any).Blockly;
        if (!Blockly) {
          setLoadError('Blockly failed to load');
          return;
        }

        registerCustomBlocks(Blockly, gameId);
        
        const javascriptGenerator = Blockly.JavaScript || ((window as any).javascript?.javascriptGenerator);
        const pythonGenerator = Blockly.Python || ((window as any).python?.pythonGenerator);
        
        if (!generatorsRegistered.current) {
          if (javascriptGenerator) registerJavascriptGenerators(javascriptGenerator);
          if (pythonGenerator) registerPythonGenerators(pythonGenerator);
          generatorsRegistered.current = true;
        }

        const darkTheme = Blockly.Theme.defineTheme('cpsLabThemeDark', {
          name: 'cpsLabThemeDark',
          base: Blockly.Themes.Classic,
          componentStyles: {
            workspaceBackgroundColour: '#0a0a10',
            toolboxBackgroundColour: '#13131a',
            toolboxForegroundColour: '#e2e8f0',
            flyoutBackgroundColour: '#0a0a10',
            flyoutForegroundColour: '#e2e8f0',
            flyoutOpacity: 0.95,
            scrollbarColour: '#3b82f6',
            scrollbarOpacity: 0.6,
            insertionMarkerColour: '#3b82f6',
            insertionMarkerOpacity: 0.6,
            cursorColour: '#3b82f6',
          },
          fontStyle: { family: 'Arial, sans-serif', weight: 'normal', size: 13 },
        });

        const lightTheme = Blockly.Theme.defineTheme('cpsLabThemeLight', {
          name: 'cpsLabThemeLight',
          base: Blockly.Themes.Classic,
          componentStyles: {
            workspaceBackgroundColour: '#f8fafc',
            toolboxBackgroundColour: '#ffffff',
            toolboxForegroundColour: '#0f172a',
            flyoutBackgroundColour: '#f1f5f9',
            flyoutForegroundColour: '#0f172a',
            flyoutOpacity: 0.95,
            scrollbarColour: '#94a3b8',
            scrollbarOpacity: 0.6,
            insertionMarkerColour: '#3b82f6',
            insertionMarkerOpacity: 0.6,
            cursorColour: '#3b82f6',
          },
          fontStyle: { family: 'Arial, sans-serif', weight: 'normal', size: 13 },
        });

        if (!blocklyDiv.current || !document.contains(blocklyDiv.current) || disposed) {
          console.warn("Blockly container not in document or disposed, aborting injection");
          return;
        }
        const workspace = Blockly.inject(blocklyDiv.current!, {
          toolbox: toolbox || TOOLBOX,
          grid: { spacing: 25, length: 3, colour: '#2a2a35', snap: true },
          zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
          trashcan: true,
          move: { scrollbars: true, drag: true, wheel: true },
          renderer: 'zelos',
          theme: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? darkTheme : lightTheme,
        });

        workspaceRef.current = workspace;
        setIsReady(true);

        if (onWorkspaceReady) {
          onWorkspaceReady(workspace);
        }

                try {
          if (!exampleXml) {
            const saved = localStorage.getItem('cps_blockly_workspace');
            if (saved) {
              Blockly.serialization.workspaces.load(JSON.parse(saved), workspace);
            }
          }
        } catch (e) {
          console.warn('Failed to load saved workspace:', e);
        }

        workspace.addChangeListener((event: any) => {
          if (event.isUiEvent) return;
          generateAllCode(workspace, Blockly);

          try {
            const json = Blockly.serialization.workspaces.save(workspace);
            localStorage.setItem('cps_blockly_workspace', JSON.stringify(json));
          } catch (e) {}
        });

        const resizeObserver = new ResizeObserver(() => Blockly.svgResize(workspace));
        if (blocklyDiv.current) resizeObserver.observe(blocklyDiv.current);
      } catch (err: any) {
        console.error('Failed to initialize Blockly:', err);
        setLoadError(err.message || 'Failed to load Block Editor');
      }
    }

    initBlockly();

    return () => {
      disposed = true;
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 bg-slate-50 dark:bg-[#0a0a10]">
        <div className="flex flex-col items-center gap-3 text-center px-8">
          <span className="material-symbols-outlined text-red-400 text-4xl">error</span>
          <p className="text-red-400 text-sm font-bold">Failed to load Block Editor</p>
          <p className="text-slate-600 dark:text-slate-400 dark:text-white/40 text-xs">{loadError}</p>
          <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={blocklyDiv} className="w-full h-full" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 bg-slate-50 dark:bg-[#0a0a10]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-space tracking-wide">Loading Blockly Engine...</p>
          </div>
        </div>
      )}
    </div>
  );
}

  function registerCustomBlocks(Blockly: any, gameId?: string) {
    // --- GENERIC GAME BLOCKS ---
    const optionsMap: any = {
      'robot-puzzle': { 
         actions: [['Assemble Robot', 'activateRobot'], ['Self-Destruct', 'explode'], ['Play Music', 'playMusic']], 
         conditions: [['Parts Connected', 'partsConnected'], ['Battery Low', 'lowBattery']] 
      },
      'traffic-light': { 
         actions: [['Light Green', 'lightGreen'], ['Light Yellow', 'lightYellow'], ['Light Red', 'lightRed']], 
         conditions: [['Timer == 10', 'timer == 10'], ['Timer == 5', 'timer == 5'], ['Pedestrian Waiting', 'pedestrian']] 
      },
      'space-rescue': { 
         actions: [['Recharge Shields', 'recharge'], ['Fire Lasers', 'fireLasers'], ['Open Hatch', 'openHatch']], 
         conditions: [['Shield < 20%', 'shield < 20'], ['Asteroid Detected', 'asteroid'], ['Oxygen Low', 'oxygenLow']] 
      },
      'drone': { 
         actions: [['Fly High', 'flyHigh'], ['Fly Low', 'flyLow'], ['Land', 'land']], 
         conditions: [['Obstacle Detected', 'obstacleDetected'], ['Battery Empty', 'batteryEmpty']] 
      },
      'hardware-match': { actions: [['Complete Puzzle', 'completePuzzle']], conditions: [['Pieces Fit', 'piecesFit']] },
      'greenhouse': { actions: [['Trigger Heater', 'triggerHeater']], conditions: [['Water Cold (<20)', 'temperature < 20']] },
      'rocket-anim': { 
         actions: [['Engage Thrust', 'thrust'], ['Deploy Parachute', 'parachute'], ['Eject', 'eject']], 
         conditions: [['System Ready', 'ready'], ['Countdown == 0', 'countdown']] 
      }
    };
    const defaultActions = [['Action', 'action']];
    const defaultConditions = [['Condition', 'condition']];
    
    const actions = (gameId && optionsMap[gameId]) ? optionsMap[gameId].actions : defaultActions;
    const conditions = (gameId && optionsMap[gameId]) ? optionsMap[gameId].conditions : defaultConditions;

    Blockly.Blocks['game_action'] = {
      init: function (this: any) {
        this.appendDummyInput().appendField('Action:').appendField(new Blockly.FieldDropdown(actions), 'ACTION');
        this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(290);
      }
    };
    Blockly.Blocks['game_condition'] = {
      init: function (this: any) {
        this.appendDummyInput().appendField('Condition:').appendField(new Blockly.FieldDropdown(conditions), 'CONDITION');
        this.setOutput(true, 'Boolean'); this.setColour(210);
      }
    };
    Blockly.Blocks['game_move'] = {
      init: function (this: any) {
        this.appendDummyInput().appendField('Move Forward by').appendField(new Blockly.FieldNumber(50, 1, 1000), 'DIST');
        this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230);
      }
    };
    Blockly.Blocks['game_turn'] = {
      init: function (this: any) {
        this.appendDummyInput().appendField('Turn Right by').appendField(new Blockly.FieldAngle(90), 'DEG');
        this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230);
      }
    };
    Blockly.Blocks['game_play_note'] = {
      init: function (this: any) {
        this.appendDummyInput().appendField('Play Note').appendField(new Blockly.FieldTextInput('C4'), 'NOTE');
        this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(330);
      }
    };

    // --- CAR BLOCKS ---
    Blockly.Blocks['car_move'] = {
    init: function (this: any) {
      this.appendDummyInput().appendField('🚗 Move').appendField(new Blockly.FieldDropdown([['Forward', 'F'], ['Backward', 'B'], ['Left', 'L'], ['Right', 'R']]), 'DIRECTION').appendField('for').appendField(new Blockly.FieldNumber(1, 0.1, 30, 0.1), 'DURATION').appendField('seconds');
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230);
    },
  };
  Blockly.Blocks['car_stop'] = {
    init: function (this: any) {
      this.appendDummyInput().appendField('🛑 Stop Car');
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(0);
    },
  };
  Blockly.Blocks['car_set_speed'] = {
    init: function (this: any) {
      this.appendDummyInput().appendField('🏎️ Set Speed to').appendField(new Blockly.FieldNumber(150, 0, 255, 1), 'SPEED');
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(160);
    },
  };
  Blockly.Blocks['car_wait'] = {
    init: function (this: any) {
      this.appendDummyInput().appendField('⏱️ Wait').appendField(new Blockly.FieldNumber(1, 0.1, 60, 0.1), 'SECONDS').appendField('seconds');
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(120);
    },
  };
  Blockly.Blocks['car_connect'] = {
    init: function (this: any) {
      this.appendDummyInput().appendField('🔗 Connect to Car via Bluetooth');
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(290);
    },
  };
  Blockly.Blocks['car_disconnect'] = {
    init: function (this: any) {
      this.appendDummyInput().appendField('🔌 Disconnect Car');
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(290);
    },
  };
  Blockly.Blocks['car_custom_command'] = {
    init: function (this: any) {
      this.appendDummyInput().appendField('📡 Send command').appendField(new Blockly.FieldTextInput('HELLO'), 'COMMAND');
      this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(65);
    },
  };
}

// ─── Register Code Generators ───────────────────────────────────

function registerJavascriptGenerators(generator: any) {
  generator.forBlock['game_action'] = function(block: any) {
    const action = block.getFieldValue('ACTION');
    return action + '();\n';
  };
  generator.forBlock['game_condition'] = function(block: any) {
    const cond = block.getFieldValue('CONDITION');
    return [cond, 0];
  };
  generator.forBlock['game_move'] = function(block: any) {
    const dist = block.getFieldValue('DIST');
    return 'moveForward(' + dist + ');\n';
  };
  generator.forBlock['game_turn'] = function(block: any) {
    const deg = block.getFieldValue('DEG');
    return 'turnRight(' + deg + ');\n';
  };
  generator.forBlock['game_play_note'] = function(block: any) {
    const note = block.getFieldValue('NOTE');
    return 'playNote("' + note + '");\n';
  };

  const dirs: Record<string, string> = { F: 'Forward', B: 'Backward', L: 'Left', R: 'Right' };
  
  generator.forBlock['car_move'] = function (block: any) {
    const dir = dirs[block.getFieldValue('DIRECTION')];
    const dur = block.getFieldValue('DURATION');
    return `await car.move('${dir}', ${dur});\n`;
  };
  generator.forBlock['car_stop'] = function () { return `await car.stop();\n`; };
  generator.forBlock['car_set_speed'] = function (block: any) { return `await car.setSpeed(${block.getFieldValue('SPEED')});\n`; };
  generator.forBlock['car_wait'] = function (block: any) { return `await car.wait(${block.getFieldValue('SECONDS')});\n`; };
  generator.forBlock['car_connect'] = function () { return `await car.connect();\n`; };
  generator.forBlock['car_disconnect'] = function () { return `await car.disconnect();\n`; };
  generator.forBlock['car_custom_command'] = function (block: any) { return `await car.sendCommand('${block.getFieldValue('COMMAND')}');\n`; };
}

function registerPythonGenerators(generator: any) {
  generator.forBlock['game_action'] = function(block: any) {
    const action = block.getFieldValue('ACTION');
    return action + '()\\n';
  };
  generator.forBlock['game_condition'] = function(block: any) {
    const cond = block.getFieldValue('CONDITION');
    return [cond, 0];
  };
  generator.forBlock['game_move'] = function(block: any) {
    const dist = block.getFieldValue('DIST');
    return 'moveForward(' + dist + ')\\n';
  };
  generator.forBlock['game_turn'] = function(block: any) {
    const deg = block.getFieldValue('DEG');
    return 'turnRight(' + deg + ')\\n';
  };
  generator.forBlock['game_play_note'] = function(block: any) {
    const note = block.getFieldValue('NOTE');
    return 'playNote("' + note + '")\\n';
  };

  const dirs: Record<string, string> = { F: 'Forward', B: 'Backward', L: 'Left', R: 'Right' };

  generator.forBlock['car_move'] = function (block: any) {
    const dir = dirs[block.getFieldValue('DIRECTION')];
    const dur = block.getFieldValue('DURATION');
    return `car.move('${dir}', ${dur})\n`;
  };
  generator.forBlock['car_stop'] = function () { return `car.stop()\n`; };
  generator.forBlock['car_set_speed'] = function (block: any) { return `car.set_speed(${block.getFieldValue('SPEED')})\n`; };
  generator.forBlock['car_wait'] = function (block: any) { return `car.wait(${block.getFieldValue('SECONDS')})\n`; };
  generator.forBlock['car_connect'] = function () { return `car.connect()\n`; };
  generator.forBlock['car_disconnect'] = function () { return `car.disconnect()\n`; };
  generator.forBlock['car_custom_command'] = function (block: any) { return `car.send_command('${block.getFieldValue('COMMAND')}')\n`; };
}





