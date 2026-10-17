import { CPSSensorDefinition, CPS_PRODUCTS_SENSORS } from './cpsSensors';
import { WireConnection } from '../components/WiresLayer';

export interface StarterProject {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  components: any[];
  wires: WireConnection[];
  initialCode: string;
}

export const STARTER_PROJECTS: StarterProject[] = [
  {
    id: 'blink-led',
    title: 'Arduino LED Blink',
    subtitle: 'Classic beginner circuit with current limiting resistor',
    description: 'Learn fundamental digital output control by connecting an Arduino digital pin through a 220-ohm resistor to an LED.',
    icon: 'lightbulb',
    components: [
      {
        instanceId: 'mcu-uno-1',
        type: 'mcu',
        title: 'Arduino UNO',
        x: 380,
        y: 120,
        rotation: 0,
        values: {},
      },
      {
        instanceId: 'breadboard-1',
        type: 'breadboard',
        title: 'Half Breadboard',
        breadboardType: 'half',
        x: 60,
        y: 120,
        rotation: 0,
        values: {},
      },
      {
        instanceId: 'led-1',
        type: 'discrete',
        discreteType: 'led',
        title: 'Red 5mm LED',
        x: 180,
        y: 180,
        rotation: 0,
        values: { color: 'red', isLit: true },
      },
      {
        instanceId: 'resistor-1',
        type: 'discrete',
        discreteType: 'resistor',
        title: '220Ω Resistor',
        x: 180,
        y: 280,
        rotation: 0,
        values: { resistance: '220' },
      },
    ],
    wires: [
      {
        id: 'w-blink-1',
        from: { id: 'mcu:13', x: 648, y: 142 },
        to: { id: 'led-1:anode', x: 200, y: 270 },
        color: '#f59e0b',
        label: 'D13 ➔ LED Anode (+)',
      },
      {
        id: 'w-blink-2',
        from: { id: 'led-1:cathode', x: 224, y: 270 },
        to: { id: 'resistor-1:pin1', x: 188, y: 300 },
        color: '#ef4444',
        label: 'LED Cathode ➔ Resistor Pin 1',
      },
      {
        id: 'w-blink-3',
        from: { id: 'resistor-1:pin2', x: 292, y: 300 },
        to: { id: 'mcu:GND', x: 634, y: 142 },
        color: '#1e293b',
        label: 'Resistor Pin 2 ➔ GND',
      },
    ],
    initialCode: `// CPS Lab - Arduino Uno Blink Circuit
const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("[CPS Firmware] Blink Sketch Loaded.");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED State: HIGH (5V ON)");
  delay(1000);

  digitalWrite(LED_PIN, LOW);
  Serial.println("LED State: LOW (0V OFF)");
  delay(1000);
}`,
  },
  {
    id: 'weather-station',
    title: 'Smart IoT Weather Station',
    subtitle: 'BME680 Environmental + Rain Gauge + Wind Anemometer',
    description: 'Complete environmental monitoring station measuring air temperature, humidity, atmospheric pressure, air quality index, rainfall, and wind speed.',
    icon: 'cloudy_snowing',
    components: [
      {
        instanceId: 'mcu-uno-1',
        type: 'mcu',
        title: 'Arduino UNO',
        x: 400,
        y: 120,
        rotation: 0,
        values: {},
      },
      {
        instanceId: 'bme680-1',
        type: 'sensor',
        sensorDef: CPS_PRODUCTS_SENSORS.find((s) => s.id === 'bme680') || CPS_PRODUCTS_SENSORS[1],
        title: 'BME680 Sensor',
        x: 70,
        y: 40,
        rotation: 0,
        values: { temperature: 27.5, humidity: 62, pressure: 1012, aqi: 42 },
      },
      {
        instanceId: 'rain-gauge-1',
        type: 'sensor',
        sensorDef: CPS_PRODUCTS_SENSORS.find((s) => s.id === 'rain-gauge') || CPS_PRODUCTS_SENSORS[2],
        title: 'Rain Gauge',
        x: 70,
        y: 340,
        rotation: 0,
        values: { rainfallRate: 15, totalTips: 4, tipActive: false },
      },
      {
        instanceId: 'lcd-1',
        type: 'discrete',
        discreteType: 'lcd',
        title: '16x2 I2C LCD Display',
        x: 400,
        y: 460,
        rotation: 0,
        values: { line1: 'Temp:27.5C Hum:62%', line2: 'Rain: 0.8mm AQI:42' },
      },
    ],
    wires: [
      {
        id: 'w-ws-1',
        from: { id: 'bme680-1:vcc', x: 130, y: 284 },
        to: { id: 'mcu:5V', x: 587, y: 420 },
        color: '#ef4444',
        label: 'BME680 VCC ➔ 5V',
      },
      {
        id: 'w-ws-2',
        from: { id: 'bme680-1:gnd', x: 190, y: 284 },
        to: { id: 'mcu:GND1', x: 601, y: 420 },
        color: '#1e293b',
        label: 'BME680 GND ➔ GND',
      },
      {
        id: 'w-ws-3',
        from: { id: 'bme680-1:sda', x: 250, y: 284 },
        to: { id: 'mcu:SDA', x: 626, y: 142 },
        color: '#06b6d4',
        label: 'BME680 SDA ➔ SDA',
      },
      {
        id: 'w-ws-4',
        from: { id: 'bme680-1:scl', x: 310, y: 284 },
        to: { id: 'mcu:SCL', x: 612, y: 142 },
        color: '#a855f7',
        label: 'BME680 SCL ➔ SCL',
      },
      {
        id: 'w-ws-5',
        from: { id: 'rain-gauge-1:sig', x: 295, y: 584 },
        to: { id: 'mcu:2', x: 830, y: 142 },
        color: '#3b82f6',
        label: 'Rain Sig ➔ Pin 2 (Interrupt)',
      },
    ],
    initialCode: `// CPS Lab - IoT Weather Station
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
const int RAIN_INTERRUPT_PIN = 2;
volatile int bucketTips = 0;

void onRainTip() {
  bucketTips++;
}

void setup() {
  Wire.begin();
  Serial.begin(9600);
  lcd.init();
  lcd.backlight();
  pinMode(RAIN_INTERRUPT_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(RAIN_INTERRUPT_PIN), onRainTip, FALLING);
  Serial.println("=== CPS Lab Weather Station Initialized ===");
}

void loop() {
  // Telemetry loop streaming live to Serial Monitor
  Serial.println("Polling Weather Telemetry Bus...");
  delay(1500);
}`,
  },
  {
    id: 'smart-light-relay',
    title: 'Smart Ambient Light & Relay Controller',
    subtitle: 'VEML7700 Lux Sensor + 5V Relay + Alarm Buzzer',
    description: 'Automated lighting and threshold triggering system using an ambient light sensor, 5V power relay, and acoustic buzzer.',
    icon: 'lightbulb',
    components: [
      {
        instanceId: 'mcu-uno-1',
        type: 'mcu',
        title: 'Arduino UNO',
        x: 400,
        y: 120,
        rotation: 0,
        values: {},
      },
      {
        instanceId: 'lux-1',
        type: 'sensor',
        sensorDef: CPS_PRODUCTS_SENSORS.find((s) => s.id === 'lux-sensor') || CPS_PRODUCTS_SENSORS[3],
        title: 'VEML7700 Lux Sensor',
        x: 70,
        y: 50,
        rotation: 0,
        values: { lux: 350 },
      },
      {
        instanceId: 'relay-1',
        type: 'sensor',
        sensorDef: CPS_PRODUCTS_SENSORS.find((s) => s.id === 'relay-module') || CPS_PRODUCTS_SENSORS[6],
        title: 'CPS Relay Switch',
        x: 70,
        y: 350,
        rotation: 0,
        values: { state: true },
      },
      {
        instanceId: 'buzzer-1',
        type: 'sensor',
        sensorDef: CPS_PRODUCTS_SENSORS.find((s) => s.id === 'buzzer-module') || CPS_PRODUCTS_SENSORS[7],
        title: 'CPS Buzzer Module',
        x: 400,
        y: 470,
        rotation: 0,
        values: { isBeeping: false, frequency: 1200 },
      },
    ],
    wires: [
      {
        id: 'w-light-1',
        from: { id: 'lux-1:sda', x: 250, y: 294 },
        to: { id: 'mcu:SDA', x: 626, y: 142 },
        color: '#06b6d4',
        label: 'Lux SDA ➔ SDA',
      },
      {
        id: 'w-light-2',
        from: { id: 'relay-1:in', x: 295, y: 594 },
        to: { id: 'mcu:7', x: 760, y: 142 },
        color: '#0ea5e9',
        label: 'Relay IN ➔ Digital 7',
      },
      {
        id: 'w-light-3',
        from: { id: 'buzzer-1:io', x: 625, y: 714 },
        to: { id: 'mcu:8', x: 738, y: 142 },
        color: '#ec4899',
        label: 'Buzzer I/O ➔ Digital 8',
      },
    ],
    initialCode: `// CPS Lab - Smart Ambient Light & Relay Controller
#include <Wire.h>

const int RELAY_PIN = 7;
const int BUZZER_PIN = 8;
const int DARK_THRESHOLD_LUX = 400; // Trigger threshold

void setup() {
  Wire.begin();
  Serial.begin(9600);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.println("[CPS Controller] Smart Lighting Automation Online.");
}

void loop() {
  // Read ambient light level
  int ambientLux = 350; // Reading from VEML7700
  Serial.print("Ambient Light: ");
  Serial.print(ambientLux);
  Serial.println(" Lux");

  if (ambientLux < DARK_THRESHOLD_LUX) {
    Serial.println("🌙 LOW LIGHT: Activating Lamp (Relay ON)");
    digitalWrite(RELAY_PIN, HIGH);
    tone(BUZZER_PIN, 1000, 80);
  } else {
    Serial.println("☀️ Daylight sufficient. Relay OFF.");
    digitalWrite(RELAY_PIN, LOW);
  }
  delay(1500);
}`,
  },
  {
    id: 'obstacle-radar',
    title: 'Obstacle Alert & Collision Avoidance',
    subtitle: 'IR Proximity Sensor + Buzzer Siren + Alert LED',
    description: 'Autonomous vehicle obstacle detection system using digital infrared sensing and audio-visual alert signaling.',
    icon: 'radar',
    components: [
      {
        instanceId: 'mcu-uno-1',
        type: 'mcu',
        title: 'Arduino UNO',
        x: 400,
        y: 120,
        rotation: 0,
        values: {},
      },
      {
        instanceId: 'ir-1',
        type: 'sensor',
        sensorDef: CPS_PRODUCTS_SENSORS.find((s) => s.id === 'ir-sensor') || CPS_PRODUCTS_SENSORS[6],
        title: 'InfraRed Sensor',
        x: 70,
        y: 80,
        rotation: 0,
        values: { obstacleDetected: true, distanceCm: 8 },
      },
      {
        instanceId: 'buzzer-1',
        type: 'sensor',
        sensorDef: CPS_PRODUCTS_SENSORS.find((s) => s.id === 'buzzer-module') || CPS_PRODUCTS_SENSORS[9],
        title: 'CPS Buzzer Module',
        x: 70,
        y: 350,
        rotation: 0,
        values: { isBeeping: true, frequency: 1500 },
      },
      {
        instanceId: 'led-1',
        type: 'discrete',
        discreteType: 'led',
        title: 'Red Alert LED',
        x: 400,
        y: 470,
        rotation: 0,
        values: { color: 'red', isLit: true },
      },
    ],
    wires: [
      {
        id: 'w-obs-1',
        from: { id: 'ir-1:out', x: 295, y: 324 },
        to: { id: 'mcu:4', x: 802, y: 142 },
        color: '#a855f7',
        label: 'IR OUT ➔ Digital 4',
      },
      {
        id: 'w-obs-2',
        from: { id: 'buzzer-1:io', x: 295, y: 594 },
        to: { id: 'mcu:8', x: 738, y: 142 },
        color: '#ec4899',
        label: 'Buzzer I/O ➔ Digital 8',
      },
      {
        id: 'w-obs-3',
        from: { id: 'mcu:13', x: 668, y: 142 },
        to: { id: 'led-1:anode', x: 420, y: 560 },
        color: '#f59e0b',
        label: 'Digital 13 ➔ LED Anode',
      },
    ],
    initialCode: `// CPS Lab - Obstacle Detection & Collision Warning
const int IR_PIN = 4;
const int BUZZER_PIN = 8;
const int LED_PIN = 13;

void setup() {
  pinMode(IR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("CPS Collision Warning Subsystem Armed.");
}

void loop() {
  int obstacle = digitalRead(IR_PIN);
  if (obstacle == LOW) { // Active LOW
    Serial.println("🚨 COLLISION ALERT: Proximity Obstacle Detected!");
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER_PIN, 1800);
  } else {
    Serial.println("Clear Path. Ready.");
    digitalWrite(LED_PIN, LOW);
    noTone(BUZZER_PIN);
  }
  delay(200);
}`,
  },
];
