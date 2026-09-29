'use client';

import React, { useEffect, useRef, useState } from 'react';

import type { CodeLanguages } from '../../block-coding/components/BlocklyEditor';

// â”€â”€â”€ Toolbox Definition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Sensor Events',
      colour: '290',
      contents: [
        {
          kind: 'category',
          name: 'Custom UI',
          colour: '330',
          contents: [
            { kind: 'block', type: 'ui_set_height' },
            { kind: 'block', type: 'ui_set_color' },
            { kind: 'block', type: 'ui_set_text' },
            { kind: 'block', type: 'colour_picker' }
          ],
        },
        { kind: 'block', type: 'iot_connect' },
        { kind: 'block', type: 'iot_disconnect' },
        { kind: 'block', type: 'iot_on_data' },
        { kind: 'block', type: 'iot_set_interval' },
        { kind: 'block', type: 'iot_get_sensor' },
      ],
    },
    {
      kind: 'category',
      name: 'Actions',
      colour: '160',
      contents: [
        { kind: 'block', type: 'iot_log' },
        { kind: 'block', type: 'iot_restart_device' },
        { kind: 'block', type: 'iot_animate' },
        { kind: 'block', type: 'iot_alert' },
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
      name: 'Math & Text',
      colour: '230',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'text' },
        { kind: 'block', type: 'text_join' },
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
      resolve(); return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

interface IoTBlocklyEditorProps {
  onCodeChange: (code: CodeLanguages) => void;
  onWorkspaceReady?: (workspace: any) => void;
  exampleXml?: string | null;
}

export default function IoTBlocklyEditor({ onCodeChange, onWorkspaceReady, exampleXml }: IoTBlocklyEditorProps) {
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

  const generateAllCode = (workspace: any, Blockly: any) => {
    const javascriptGenerator = Blockly.JavaScript || (window as any).javascript?.javascriptGenerator;
    const pythonGenerator = Blockly.Python || (window as any).python?.pythonGenerator;

    let jsCode = '';
    let pyCode = '';
    
    if (javascriptGenerator) jsCode = javascriptGenerator.workspaceToCode(workspace);
    if (pythonGenerator) pyCode = pythonGenerator.workspaceToCode(workspace);

    const fullJs = jsCode;
    const fullPy = pyCode;
    
    const fullCpp = jsCode
      ? `#include <SensorData.h>\n\nvoid onSensorData(Sensor sensor) {\n${jsCode
          .replace(/log\(/g, 'Serial.println(')
          .replace(/alert\(/g, 'triggerAlarm(')
          .split('\n')
          .map((line: string) => '  ' + line)
          .join('\n')}\n}`
      : '';

    const fullJava = jsCode
      ? `import com.cpslab.SensorEvent;\n\npublic class IoTLogic {\n  public void onSensorData(SensorEvent sensor) {\n${jsCode
          .replace(/log\(/g, 'System.out.println(')
          .replace(/alert\(/g, 'Dashboard.showAlert(')
          .split('\n')
          .map((line: string) => '    ' + line)
          .join('\n')}\n  }\n}`
      : '';

    onCodeChange({ javascript: fullJs, python: fullPy, cpp: fullCpp, java: fullJava });
  };

  useEffect(() => {
    if (workspaceRef.current && exampleXml) {
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
  }, [exampleXml]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!blocklyDiv.current || workspaceRef.current) return;
    let disposed = false;

    async function initBlockly() {
      try {
        await loadScript('https://unpkg.com/blockly@10.4.3/blockly_compressed.js');
        await loadScript('https://unpkg.com/blockly@10.4.3/blocks_compressed.js');
        await loadScript('https://unpkg.com/blockly@10.4.3/javascript_compressed.js');
        await loadScript('https://unpkg.com/blockly@10.4.3/python_compressed.js');
        await loadScript('https://unpkg.com/blockly@10.4.3/msg/en.js');

        if (disposed) return;
        const Blockly = (window as any).Blockly;
        if (!Blockly) throw new Error('Blockly failed to load');

        if (Blockly.Tooltip) Blockly.Tooltip.HOVER_MS = 50;

        registerCustomBlocks(Blockly);
        
        const javascriptGenerator = Blockly.JavaScript || ((window as any).javascript?.javascriptGenerator);
        const pythonGenerator = Blockly.Python || ((window as any).python?.pythonGenerator);
        
        if (!generatorsRegistered.current) {
          if (javascriptGenerator) registerJavascriptGenerators(javascriptGenerator, Blockly);
          if (pythonGenerator) registerPythonGenerators(pythonGenerator, Blockly);
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
            scrollbarColour: '#1e293b',
            scrollbarOpacity: 0.5,
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
            scrollbarColour: '#cbd5e1',
            scrollbarOpacity: 0.5,
          },
          fontStyle: { family: 'Arial, sans-serif', weight: 'normal', size: 13 },
        });

        const workspace = Blockly.inject(blocklyDiv.current!, {
          toolbox: TOOLBOX,
          grid: { spacing: 25, length: 3, colour: '#2a2a35', snap: true },
          zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
          trashcan: true,
          move: { scrollbars: true, drag: true, wheel: true },
          renderer: 'zelos',
          theme: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? darkTheme : lightTheme,
        });

        workspaceRef.current = workspace;
        setIsReady(true);
        if (onWorkspaceReady) onWorkspaceReady(workspace);

        workspace.addChangeListener((event: any) => {
          if (event.isUiEvent) return;
          generateAllCode(workspace, Blockly);
        });
      } catch (err: any) {
        setLoadError(err.message || 'Failed to load IoT Block Editor');
      }
    }
    initBlockly();
    return () => { disposed = true; if (workspaceRef.current) workspaceRef.current.dispose(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loadError) return <div className="text-red-400 p-8">{loadError}</div>;

  return (
    <div className="relative w-full h-full">
      <div ref={blocklyDiv} className="w-full h-full" />
      {!isReady && <div className="absolute inset-0 flex items-center justify-center bg-slate-50 bg-slate-50 dark:bg-[#0a0a10] text-slate-600 dark:text-slate-400">Loading IoT Editor...</div>}
    </div>
  );
}

function registerCustomBlocks(Blockly: any) {
  Blockly.Blocks['iot_set_interval'] = {
    init: function (this: any) {
      this.appendDummyInput().appendField('Every').appendField(new Blockly.FieldNumber(1, 0.1, 3600), 'SECONDS').appendField('seconds');
      this.appendStatementInput('DO').setCheck(null).appendField('do');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip(function() { return 'Timer Block: Runs the blocks inside repeatedly at the specified interval (in seconds).'; });
      this.setHelpUrl('');
    },
  };
  Blockly.Blocks['iot_restart_device'] = {
    init: function (this: any) {
      this.appendDummyInput().appendField('Restart Hardware Device');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
      this.setTooltip(function() { return 'Restart Block: Sends a reset signal to reboot your Arduino/ESP32 sensor device.'; });
      this.setHelpUrl('');
    },
  };
  Blockly.Blocks['iot_disconnect'] = {
    init: function (this: any) {
      this.appendDummyInput().appendField('Disconnect Sensor');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
      this.setTooltip(function() { return 'Disconnect Block: Safely closes the USB connection to the sensor device.'; });
      this.setHelpUrl('');
    },
  };
  Blockly.Blocks['iot_connect'] = {
    init: function (this: any) {
      this.appendDummyInput().appendField('Connect to Sensor');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip(function() { return 'Connect Block: Opens a USB connection to your sensor device so you can start reading data.'; });
      this.setHelpUrl('');
    },
  };
  Blockly.Blocks['iot_on_data'] = {
    init: function (this: any) {
      this.appendDummyInput().appendField('When new sensor data arrives');
      this.appendStatementInput('DO').setCheck(null).appendField('do');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip(function() { return 'Event Block: Runs the blocks inside every time the sensor sends new data.'; });
      this.setHelpUrl('');
    },
  };
  Blockly.Blocks['iot_animate'] = {
    init: function (this: any) {
      this.appendValueInput('VALUE')
        .appendField('Show')
        .appendField(
          new Blockly.FieldDropdown([
            ['Heat/Temperature', 'heat'],
            ['Humidity Level', 'humidity'],
            ['Rain Level', 'rain'],
            ['Wind Speed', 'wind'],
            ['Smart LED', 'led'],
          ]),
          'ANIM_TYPE'
        )
        .appendField('Animation')
        .appendField('with intensity/value');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
      this.setTooltip(function() { return 'Renders a visual animation on the dashboard using the sensor value.'; });
      this.setHelpUrl('');
    },
  };
  Blockly.Blocks['ui_set_height'] = {
    init: function (this: any) {
      this.appendValueInput('VALUE').setCheck('Number').appendField('Set UI Box Height %');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip(function() { return 'UI Block: Changes the height of the custom UI box on your dashboard (0-100%).'; });
      this.setHelpUrl('');
    }
  };
  Blockly.Blocks['ui_set_color'] = {
    init: function (this: any) {
      this.appendValueInput('COLOR').setCheck('Colour').appendField('Set UI Box Color');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip(function() { return 'UI Block: Changes the background color of the custom UI box on your dashboard.'; });
      this.setHelpUrl('');
    }
  };
  Blockly.Blocks['ui_set_text'] = {
    init: function (this: any) {
      this.appendValueInput('TEXT').setCheck('String').appendField('Set UI Box Text');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(330);
      this.setTooltip(function() { return 'UI Block: Shows custom text inside the dashboard UI box.'; });
      this.setHelpUrl('');
    }
  };
Blockly.Blocks['iot_get_sensor'] = {
    init: function (this: any) {
      this.appendDummyInput().appendField('Sensor')
        .appendField(new Blockly.FieldDropdown([
            ['Temperature', 'temperature'],
            ['Humidity', 'humidity'],
            ['Light Level', 'light'],
            ['Wind Speed', 'wind'],
            ['Rain Level', 'rain'],
            ['Moisture', 'moisture'],
            ['Air Quality', 'air_quality'],
            ['Acceleration (Z)', 'acceleration_z'],
            ['Raw Text', 'raw']
          ]), 'SENSOR_TYPE');
      this.setOutput(true, ['Number', 'String']);
      this.setColour(290);
      this.setTooltip(function() { return 'Sensor Block: Gets the live value from the selected sensor (Temperature, Humidity, etc).'; });
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['iot_log'] = {
    init: function (this: any) {
      this.appendValueInput('VALUE').setCheck(null).appendField('Log to dashboard');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip(function() { return 'Prints text or sensor data to the Live Sensor Data terminal (like a diary!).'; });
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks['iot_alert'] = {
    init: function (this: any) {
      this.appendValueInput('MESSAGE').setCheck(null).appendField('Trigger Alert');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
      this.setTooltip(function() { return 'Triggers a pop-up warning alert on your screen.'; });
      this.setHelpUrl('');
    },
  };
}

function registerJavascriptGenerators(generator: any, Blockly: any) {

  generator.forBlock['iot_set_interval'] = function (block: any) {
    const seconds = block.getFieldValue('SECONDS');
    const branch = generator.statementToCode(block, 'DO');
    return `setInterval(async () => {\n${branch}}, ${seconds} * 1000);\n`;
  };
  generator.forBlock['iot_restart_device'] = function () {
    return `await restartDevice();\n`;
  };
  generator.forBlock['iot_connect'] = function () {
    return `await connect();\n`;
  };
  generator.forBlock['iot_disconnect'] = function () {
    return `await disconnect();\n`;
  };
  generator.forBlock['iot_on_data'] = function (block: any) {
    const branch = generator.statementToCode(block, 'DO');
    return `async function handleSensorData(sensor) {\n${branch}}\nonData(handleSensorData);\n`;
  };
    generator.forBlock['iot_animate'] = function (block: any) {
    const type = block.getFieldValue('ANIM_TYPE');
    const value = generator.valueToCode(block, 'VALUE', generator.ORDER_ATOMIC) || '0';
    return `animate('${type}', ${value});
`;
  };
  generator.forBlock['ui_set_height'] = function (block: any) {
    const val = generator.valueToCode(block, 'VALUE', generator.ORDER_ATOMIC) || '0';
    return `updateCustomUI({ height: ${val} });
`;
  };
  generator.forBlock['ui_set_color'] = function (block: any) {
    const col = generator.valueToCode(block, 'COLOR', generator.ORDER_ATOMIC) || "'#3b82f6'";
    return `updateCustomUI({ color: ${col} });
`;
  };
  generator.forBlock['ui_set_text'] = function (block: any) {
    const txt = generator.valueToCode(block, 'TEXT', generator.ORDER_ATOMIC) || "''";
    return `updateCustomUI({ text: ${txt} });
`;
  };
generator.forBlock['iot_get_sensor'] = function (block: any) {
    const type = block.getFieldValue('SENSOR_TYPE');
    return [`(getSensor('${type}') || 0)`, generator.ORDER_ATOMIC];
  };
  generator.forBlock['iot_log'] = function (block: any) {
    const val = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '""';
    return `log(${val});\n`;
  };
  generator.forBlock['iot_alert'] = function (block: any) {
    const val = generator.valueToCode(block, 'MESSAGE', generator.ORDER_NONE) || '""';
    return `alert(${val});\n`;
  };
}

function registerPythonGenerators(generator: any, Blockly: any) {

  generator.forBlock['iot_set_interval'] = function (block: any) {
    const seconds = block.getFieldValue('SECONDS');
    const branch = generator.statementToCode(block, 'DO') || '  pass\n';
    return `def interval_func():\n${branch}\nsensor.set_interval(${seconds}, interval_func)\n`;
  };
  generator.forBlock['iot_restart_device'] = function () {
    return `sensor.restart()\n`;
  };
  generator.forBlock['iot_connect'] = function () {
    return `sensor.connect()\n`;
  };
  generator.forBlock['iot_disconnect'] = function () {
    return `sensor.disconnect()\n`;
  };
  generator.forBlock['iot_on_data'] = function (block: any) {
    const branch = generator.statementToCode(block, 'DO') || '  pass\n';
    return `def on_sensor_data(data):\n${branch}\nsensor.on_data(on_sensor_data)\n`;
  };
    generator.forBlock['iot_animate'] = function (block: any) {
    const type = block.getFieldValue('ANIM_TYPE');
    const value = generator.valueToCode(block, 'VALUE', generator.ORDER_ATOMIC) || '0';
    return `animate('${type}', ${value});
`;
  };
  generator.forBlock['ui_set_height'] = function (block: any) {
    const val = generator.valueToCode(block, 'VALUE', generator.ORDER_ATOMIC) || '0';
    return `updateCustomUI({ height: ${val} });
`;
  };
  generator.forBlock['ui_set_color'] = function (block: any) {
    const col = generator.valueToCode(block, 'COLOR', generator.ORDER_ATOMIC) || "'#3b82f6'";
    return `updateCustomUI({ color: ${col} });
`;
  };
  generator.forBlock['ui_set_text'] = function (block: any) {
    const txt = generator.valueToCode(block, 'TEXT', generator.ORDER_ATOMIC) || "''";
    return `updateCustomUI({ text: ${txt} });
`;
  };
generator.forBlock['iot_get_sensor'] = function (block: any) {
    const type = block.getFieldValue('SENSOR_TYPE');
    return [`sensor.get('${type}', 0)`, generator.ORDER_ATOMIC];
  };
  generator.forBlock['iot_log'] = function (block: any) {
    const val = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || '""';
    return `dashboard.log(${val})\n`;
  };
  generator.forBlock['iot_alert'] = function (block: any) {
    const val = generator.valueToCode(block, 'MESSAGE', generator.ORDER_NONE) || '""';
    return `dashboard.alert(${val})\n`;
  };
}
