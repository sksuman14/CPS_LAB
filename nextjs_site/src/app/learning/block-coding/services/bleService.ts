/// <reference types="web-bluetooth" />

export interface BLEState {
  isConnected: boolean;
  deviceName: string | null;
  error: string | null;
}

const SERVICE_UUID = '19b10000-e8f2-537e-4f6c-d104768a1214';
const CHAR_UUID = '19b10001-e8f2-537e-4f6c-d104768a1214';

let device: BluetoothDevice | null = null;
let characteristic: BluetoothRemoteGATTCharacteristic | null = null;
let onStateChange: ((state: BLEState) => void) | null = null;

function updateState(state: Partial<BLEState>) {
  if (onStateChange) {
    onStateChange({
      isConnected: !!device?.gatt?.connected,
      deviceName: device?.name || null,
      error: null,
      ...state,
    } as BLEState);
  }
}

export function onBLEStateChange(callback: (state: BLEState) => void) {
  onStateChange = callback;
}

export function isWebBluetoothSupported() {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

export async function connectCar() {
  if (!isWebBluetoothSupported()) {
    updateState({ error: 'Web Bluetooth is not supported in this browser.' });
    return;
  }

  try {
    device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }],
    });

    device.addEventListener('gattserverdisconnected', () => {
      updateState({ isConnected: false, deviceName: null });
      characteristic = null;
    });

    const server = await device.gatt?.connect();
    if (!server) throw new Error('Failed to connect to GATT server');

    const service = await server.getPrimaryService(SERVICE_UUID);
    characteristic = await service.getCharacteristic(CHAR_UUID);

    updateState({ isConnected: true, deviceName: device.name, error: null });
  } catch (error: any) {
    console.error('BLE Connect Error:', error);
    updateState({ error: error.message });
  }
}

export async function disconnectCar() {
  if (device?.gatt?.connected) {
    device.gatt.disconnect();
  }
}

export async function sendCommand(command: string) {
  if (!characteristic) {
    throw new Error('Not connected to the car');
  }
  const encoder = new TextEncoder();
  await characteristic.writeValue(encoder.encode(command));
}
