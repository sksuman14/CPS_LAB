export interface SerialState {
  isConnected: boolean;
  portName: string | null;
  error: string | null;
}

let port: any = null;
let reader: any = null;
let readableStreamClosed: Promise<void> | null = null;
let keepReading = true;
let onStateChange: ((state: SerialState) => void) | null = null;
let onDataReceived: ((data: any) => void) | null = null;

function updateState(state: Partial<SerialState>) {
  if (onStateChange) {
    onStateChange({
      isConnected: !!port,
      portName: port ? 'USB Serial Device' : null,
      error: null,
      ...state,
    } as SerialState);
  }
}

export function onSerialStateChange(callback: (state: SerialState) => void) {
  onStateChange = callback;
}

export function onSensorData(callback: (data: any) => void) {
  onDataReceived = callback;
}

export function isWebSerialSupported() {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
}

export async function connectSerial() {
  if (!isWebSerialSupported()) {
    updateState({ error: 'Web Serial is not supported in this browser.' });
    return;
  }

  if (port) {
    // Already connected
    return;
  }

  try {
    const navSerial = (navigator as any).serial;
    port = await navSerial.requestPort();
    
    // Most ESP32 / Arduino sensor streams use 9600 or 115200. We'll use 115200 as default modern standard, 
    // but can be configurable if needed. For now, 115200.
    await port.open({ baudRate: 115200 });
    
    updateState({ isConnected: true, error: null });
    
    keepReading = true;
    readLoop();
      } catch (error: any) {
    if (error.name === 'NotFoundError' || error.message.includes('No port selected by the user')) {
      // User simply cancelled the prompt, gracefully ignore without logging as an error
      console.log('Serial connection cancelled by user.');
      updateState({ error: null });
      throw new Error("Connection cancelled by user");
    } else {
      console.error('Serial Connect Error:', error);
      updateState({ error: error.message });
      throw error;
    }
    port = null;
  }
}

async function readLoop() {
  if (!port) return;

  const textDecoder = new TextDecoderStream();
  readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
  reader = textDecoder.readable.getReader();

  let buffer = '';

  try {
    while (keepReading) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      if (value) {
        buffer += value;
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Attempt to parse as JSON (e.g., {"temperature": 25, "humidity": 60})
          try {
            const data = JSON.parse(trimmed);
            if (onDataReceived) onDataReceived(data);
          } catch (e) {
            // If not JSON, just wrap it in a generic value object
            const extracted: any = { raw: trimmed };
            
            // Attempt smart extraction for classic Arduino Serial.print formats
            const tempMatch = trimmed.match(/temp(?:erature)?\s*[:=]\s*(-?[\d.]+)/i);
            if (tempMatch) extracted.temperature = parseFloat(tempMatch[1]);
            
            const humMatch = trimmed.match(/hum(?:idity)?\s*[:=]\s*(-?[\d.]+)/i);
            if (humMatch) extracted.humidity = parseFloat(humMatch[1]);
            
            const lightMatch = trimmed.match(/light\s*[:=]\s*(-?[\d.]+)/i);
            if (lightMatch) extracted.light = parseFloat(lightMatch[1]);
              const windMatch = trimmed.match(/wind\s*[:=]\s*(-?[\d.]+)/i);
              if (windMatch) extracted.wind = parseFloat(windMatch[1]);
              const rainMatch = trimmed.match(/rain\s*[:=]\s*(-?[\d.]+)/i);
              if (rainMatch) extracted.rain = parseFloat(rainMatch[1]);
              const distMatch = trimmed.match(/dist(?:ance)?\s*[:=]\s*(-?[\d.]+)/i);
              if (distMatch) extracted.distance = parseFloat(distMatch[1]);

            if (onDataReceived) onDataReceived(extracted);
          }
        }
      }
    }
  } catch (error) {
    console.error('Serial Read Error:', error);
  } finally {
    reader.releaseLock();
  }
}

export async function disconnectSerial() {
  keepReading = false;
  
  if (reader) {
    try {
      await reader.cancel();
    } catch (e) {}
    reader = null;
  }
  
  if (readableStreamClosed) {
    try {
      await readableStreamClosed.catch(() => {});
    } catch (e) {}
    readableStreamClosed = null;
  }
  
  if (port) {
    try {
      await port.close();
    } catch (e) {
      console.error('Error closing port', e);
    }
    port = null;
  }
  
  updateState({ isConnected: false, portName: null });
}

export async function restartDevice() {
  if (!port) {
    console.warn("Cannot restart: No port connected.");
    return;
  }
  try {
    // Standard sequence to reset Arduino/ESP32:
    // Drop DTR/RTS to LOW (true in Web Serial means assert/LOW voltage)
    await port.setSignals({ dataTerminalReady: true, requestToSend: true });
    // Wait a brief moment
    await new Promise(resolve => setTimeout(resolve, 100));
    // Release DTR/RTS to HIGH
    await port.setSignals({ dataTerminalReady: false, requestToSend: false });
    console.log("Device restart signal sent.");
  } catch (error) {
    console.error("Failed to send restart signal:", error);
  }
}
