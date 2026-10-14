export interface SensorPin {
  id: string;
  name: string;
  type: 'power' | 'ground' | 'analog' | 'digital' | 'i2c' | 'rs485';
  defaultWireColor: string;
  suggestedMcuPin?: string;
  x: number; // percentage offset on sensor card
  y: number;
}

export interface CPSSensorDefinition {
  id: string;
  title: string;
  subtitle: string;
  category: 'Environmental' | 'Agriculture' | 'Motion & Proximity' | 'Actuators' | 'Industrial';
  icon: string;
  imagePath: string;
  productSlug: string;
  datasheetKey: string;
  pins: SensorPin[];
  defaultValues: Record<string, number | boolean>;
  controls: {
    key: string;
    label: string;
    type: 'slider' | 'toggle' | 'button';
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    options?: { label: string; value: any }[];
  }[];
  readFormula: (values: Record<string, any>) => {
    analogVal?: number; // 0-1023
    digitalVal?: boolean;
    i2cData?: Record<string, number | string>;
    serialString?: string;
  };
  sampleCode: string;
}

export const CPS_PRODUCTS_SENSORS: CPSSensorDefinition[] = [
  {
    id: 'soil-spectra',
    title: 'Soil Spectra',
    subtitle: 'Smart soil sensing for precision agriculture',
    category: 'Agriculture',
    icon: 'emoji_nature',
    imagePath: 'assets/images/blegateway.png',
    productSlug: 'soil-spectra',
    datasheetKey: 'SoilSensor',
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'power', defaultWireColor: '#ef4444', suggestedMcuPin: '5V', x: 20, y: 100 },
      { id: 'gnd', name: 'GND', type: 'ground', defaultWireColor: '#1e293b', suggestedMcuPin: 'GND', x: 40, y: 100 },
      { id: 'sig', name: 'SIG (Moisture)', type: 'analog', defaultWireColor: '#22c55e', suggestedMcuPin: 'A0', x: 60, y: 100 },
      { id: 'temp', name: 'TEMP', type: 'analog', defaultWireColor: '#eab308', suggestedMcuPin: 'A1', x: 80, y: 100 },
    ],
    defaultValues: { moisture: 45, temperature: 24.5, ec: 420 },
    controls: [
      { key: 'moisture', label: 'Soil Moisture', type: 'slider', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'temperature', label: 'Soil Temp', type: 'slider', min: 0, max: 50, step: 0.5, unit: '°C' },
      { key: 'ec', label: 'Conductivity (EC)', type: 'slider', min: 0, max: 2000, step: 10, unit: 'µS/cm' },
    ],
    readFormula: (vals) => ({
      analogVal: Math.round((vals.moisture / 100) * 1023),
      serialString: `[Soil Spectra] Moisture: ${vals.moisture}% | Temp: ${vals.temperature}°C | EC: ${vals.ec} uS/cm`
    }),
    sampleCode: `// CPS Lab - Soil Spectra Sensor Reader
const int SOIL_PIN = A0;
const int TEMP_PIN = A1;

void setup() {
  Serial.begin(9600);
  pinMode(SOIL_PIN, INPUT);
  pinMode(TEMP_PIN, INPUT);
  Serial.println("Soil Spectra Sensor Initialized.");
}

void loop() {
  int rawMoisture = analogRead(SOIL_PIN);
  float moisturePct = map(rawMoisture, 0, 1023, 0, 100);
  
  int rawTemp = analogRead(TEMP_PIN);
  float tempC = (rawTemp * 5.0 / 1024.0) * 10.0;

  Serial.print("Soil Moisture: ");
  Serial.print(moisturePct);
  Serial.print("% | Temp: ");
  Serial.print(tempC);
  Serial.println(" C");

  delay(1000);
}`
  },
  {
    id: 'bme680',
    title: 'BME680 Sensor',
    subtitle: 'Environmental Temp, Humidity, Pressure & Gas',
    category: 'Environmental',
    icon: 'thermostat',
    imagePath: 'assets/images/blegateway.png',
    productSlug: 'bme680-temperature-humidity-pressure-and-gas-sensor',
    datasheetKey: 'BME680',
    pins: [
      { id: 'vcc', name: 'VCC (3.3V/5V)', type: 'power', defaultWireColor: '#ef4444', suggestedMcuPin: '5V', x: 20, y: 100 },
      { id: 'gnd', name: 'GND', type: 'ground', defaultWireColor: '#1e293b', suggestedMcuPin: 'GND', x: 40, y: 100 },
      { id: 'sda', name: 'SDA', type: 'i2c', defaultWireColor: '#06b6d4', suggestedMcuPin: 'A4', x: 60, y: 100 },
      { id: 'scl', name: 'SCL', type: 'i2c', defaultWireColor: '#a855f7', suggestedMcuPin: 'A5', x: 80, y: 100 },
    ],
    defaultValues: { temperature: 26.2, humidity: 55, pressure: 1013, aqi: 48 },
    controls: [
      { key: 'temperature', label: 'Air Temperature', type: 'slider', min: -10, max: 60, step: 0.5, unit: '°C' },
      { key: 'humidity', label: 'Relative Humidity', type: 'slider', min: 10, max: 95, step: 1, unit: '%' },
      { key: 'pressure', label: 'Barometric Pressure', type: 'slider', min: 900, max: 1100, step: 1, unit: 'hPa' },
      { key: 'aqi', label: 'Air Quality (VOC)', type: 'slider', min: 0, max: 500, step: 5, unit: 'AQI' },
    ],
    readFormula: (vals) => ({
      i2cData: vals,
      serialString: `[BME680] Temp: ${vals.temperature}°C | Hum: ${vals.humidity}% | Pres: ${vals.pressure} hPa | AQI: ${vals.aqi}`
    }),
    sampleCode: `// CPS Lab - BME680 I2C Environmental Station
#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(9600);
  Serial.println("BME680 I2C Multi-Sensor Ready.");
}

void loop() {
  // Read simulated I2C data packet
  Serial.println("--- Reading BME680 Station ---");
  delay(1200);
}`
  },
  {
    id: 'rain-gauge',
    title: 'Rain Gauge',
    subtitle: 'Tipping bucket automated rainfall recorder',
    category: 'Environmental',
    icon: 'rainy',
    imagePath: 'assets/images/gauge.png',
    productSlug: 'rain-gauge',
    datasheetKey: 'RainGauge',
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'power', defaultWireColor: '#ef4444', suggestedMcuPin: '5V', x: 25, y: 100 },
      { id: 'gnd', name: 'GND', type: 'ground', defaultWireColor: '#1e293b', suggestedMcuPin: 'GND', x: 50, y: 100 },
      { id: 'sig', name: 'SIG (Pulse)', type: 'digital', defaultWireColor: '#3b82f6', suggestedMcuPin: '2', x: 75, y: 100 },
    ],
    defaultValues: { rainfallRate: 12, totalTips: 0, tipActive: false },
    controls: [
      { key: 'rainfallRate', label: 'Rainfall Intensity', type: 'slider', min: 0, max: 80, step: 2, unit: 'mm/h' },
      { key: 'tipActive', label: 'Trigger Bucket Tip', type: 'button' }
    ],
    readFormula: (vals) => ({
      digitalVal: vals.tipActive,
      serialString: `[Rain Gauge] Tip Count: ${vals.totalTips} | Total Accumulation: ${(vals.totalTips * 0.2).toFixed(1)} mm`
    }),
    sampleCode: `// CPS Lab - Tipping Bucket Rain Gauge Reader
const int RAIN_PULSE_PIN = 2; // Interrupt Pin
volatile int tipCounter = 0;
const float MM_PER_TIP = 0.2; // 0.2mm resolution

void onBucketTip() {
  tipCounter++;
}

void setup() {
  Serial.begin(9600);
  pinMode(RAIN_PULSE_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(RAIN_PULSE_PIN), onBucketTip, FALLING);
  Serial.println("Rain Gauge Monitoring Station Active.");
}

void loop() {
  float totalRainfall = tipCounter * MM_PER_TIP;
  Serial.print("Tips: ");
  Serial.print(tipCounter);
  Serial.print(" | Total Rain: ");
  Serial.print(totalRainfall);
  Serial.println(" mm");
  delay(1500);
}`
  },
  {
    id: 'ultrasonic-anemometer',
    title: 'Ultrasonic Anemometer',
    subtitle: 'High precision wind speed and direction measurement',
    category: 'Industrial',
    icon: 'air',
    imagePath: 'assets/images/ultrasonic.png',
    productSlug: 'ultrasonic-anemometer',
    datasheetKey: 'WindSensor',
    pins: [
      { id: 'vcc', name: 'VCC (12V/5V)', type: 'power', defaultWireColor: '#ef4444', suggestedMcuPin: '5V', x: 20, y: 100 },
      { id: 'gnd', name: 'GND', type: 'ground', defaultWireColor: '#1e293b', suggestedMcuPin: 'GND', x: 40, y: 100 },
      { id: 'a', name: 'RS485-A', type: 'rs485', defaultWireColor: '#eab308', suggestedMcuPin: '10', x: 60, y: 100 },
      { id: 'b', name: 'RS485-B', type: 'rs485', defaultWireColor: '#3b82f6', suggestedMcuPin: '11', x: 80, y: 100 },
    ],
    defaultValues: { windSpeed: 8.4, windDirection: 145 },
    controls: [
      { key: 'windSpeed', label: 'Wind Speed', type: 'slider', min: 0, max: 60, step: 0.5, unit: 'm/s' },
      { key: 'windDirection', label: 'Wind Direction', type: 'slider', min: 0, max: 360, step: 5, unit: '°' },
    ],
    readFormula: (vals) => ({
      serialString: `[Anemometer Modbus] Speed: ${vals.windSpeed} m/s (${(vals.windSpeed * 3.6).toFixed(1)} km/h) | Heading: ${vals.windDirection}°`
    }),
    sampleCode: `// CPS Lab - Ultrasonic Wind Station (Modbus RS485)
#include <SoftwareSerial.h>

SoftwareSerial modbusSerial(10, 11); // RX, TX

void setup() {
  Serial.begin(9600);
  modbusSerial.begin(9600);
  Serial.println("Ultrasonic Anemometer Initialized.");
}

void loop() {
  // Query Modbus packet from Wind Sensor
  Serial.println("[Modbus Query] Reading Wind Vector Δ ToF...");
  delay(1000);
}`
  },
  {
    id: 'lux-sensor',
    title: 'VEML7700 Lux Sensor',
    subtitle: 'High precision ambient light intensity sensor',
    category: 'Environmental',
    icon: 'lightbulb',
    imagePath: 'assets/images/blegateway.png',
    productSlug: 'lux-sensor',
    datasheetKey: 'LuxSensor',
    pins: [
      { id: 'vcc', name: 'VCC (3.3V/5V)', type: 'power', defaultWireColor: '#ef4444', suggestedMcuPin: '5V', x: 20, y: 100 },
      { id: 'gnd', name: 'GND', type: 'ground', defaultWireColor: '#1e293b', suggestedMcuPin: 'GND', x: 40, y: 100 },
      { id: 'sda', name: 'SDA', type: 'i2c', defaultWireColor: '#06b6d4', suggestedMcuPin: 'A4', x: 60, y: 100 },
      { id: 'scl', name: 'SCL', type: 'i2c', defaultWireColor: '#a855f7', suggestedMcuPin: 'A5', x: 80, y: 100 },
    ],
    defaultValues: { lux: 650 },
    controls: [
      { key: 'lux', label: 'Light Level', type: 'slider', min: 0, max: 50000, step: 50, unit: 'Lux' },
    ],
    readFormula: (vals) => ({
      serialString: `[Lux Sensor] Ambient Light: ${vals.lux} lx (${vals.lux > 1000 ? 'Daylight' : 'Dim/Indoor'})`
    }),
    sampleCode: `// CPS Lab - Ambient Lux Meter (I2C)
#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(9600);
  Serial.println("VEML7700 Lux Sensor Ready.");
}

void loop() {
  // Read simulated I2C lux level
  Serial.println("Measuring ambient light intensity...");
  delay(1000);
}`
  },
  {
    id: 'lis3dh',
    title: 'LIS3DH Motion Sensor',
    subtitle: '3-axis ultra low power linear accelerometer',
    category: 'Motion & Proximity',
    icon: '3d_rotation',
    imagePath: 'assets/images/blegateway.png',
    productSlug: 'lis3dh-motion-sensor',
    datasheetKey: 'LIS3DH',
    pins: [
      { id: 'vcc', name: 'VCC (3.3V)', type: 'power', defaultWireColor: '#ef4444', suggestedMcuPin: '3.3V', x: 20, y: 100 },
      { id: 'gnd', name: 'GND', type: 'ground', defaultWireColor: '#1e293b', suggestedMcuPin: 'GND', x: 40, y: 100 },
      { id: 'sda', name: 'SDA', type: 'i2c', defaultWireColor: '#06b6d4', suggestedMcuPin: 'A4', x: 60, y: 100 },
      { id: 'scl', name: 'SCL', type: 'i2c', defaultWireColor: '#a855f7', suggestedMcuPin: 'A5', x: 80, y: 100 },
    ],
    defaultValues: { pitch: 5, roll: -2, isShaking: false },
    controls: [
      { key: 'pitch', label: 'Pitch Tilt (X-Axis)', type: 'slider', min: -90, max: 90, step: 1, unit: '°' },
      { key: 'roll', label: 'Roll Tilt (Y-Axis)', type: 'slider', min: -90, max: 90, step: 1, unit: '°' },
      { key: 'isShaking', label: 'Simulate Shake / Vibration', type: 'toggle' }
    ],
    readFormula: (vals) => ({
      serialString: `[LIS3DH] Accel X: ${(vals.pitch / 90).toFixed(2)}g | Y: ${(vals.roll / 90).toFixed(2)}g | Z: 0.98g ${vals.isShaking ? '⚠️ [VIBRATION EVENT]' : ''}`
    }),
    sampleCode: `// CPS Lab - LIS3DH 3-Axis Orientation Monitor
#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(9600);
  Serial.println("LIS3DH Accelerometer Online.");
}

void loop() {
  Serial.println("Polling 3-Axis acceleration vector...");
  delay(500);
}`
  },
  {
    id: 'ir-sensor',
    title: 'InfraRed Sensor',
    subtitle: 'Digital obstacle detection and line tracking sensor',
    category: 'Motion & Proximity',
    icon: 'sensors',
    imagePath: 'assets/images/blegateway.png',
    productSlug: 'infrared-sensor',
    datasheetKey: 'IRSensor',
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'power', defaultWireColor: '#ef4444', suggestedMcuPin: '5V', x: 25, y: 100 },
      { id: 'gnd', name: 'GND', type: 'ground', defaultWireColor: '#1e293b', suggestedMcuPin: 'GND', x: 50, y: 100 },
      { id: 'out', name: 'OUT', type: 'digital', defaultWireColor: '#a855f7', suggestedMcuPin: '4', x: 75, y: 100 },
    ],
    defaultValues: { obstacleDetected: false, distanceCm: 15 },
    controls: [
      { key: 'obstacleDetected', label: 'Obstacle in Front', type: 'toggle' },
      { key: 'distanceCm', label: 'Distance', type: 'slider', min: 2, max: 30, step: 1, unit: 'cm' }
    ],
    readFormula: (vals) => ({
      digitalVal: !vals.obstacleDetected, // Active LOW
      serialString: `[IR Sensor] Pin State: ${vals.obstacleDetected ? 'LOW (OBSTACLE DETECTED)' : 'HIGH (CLEAR)'} | Distance: ~${vals.distanceCm}cm`
    }),
    sampleCode: `// CPS Lab - Infrared Proximity & Obstacle Detection
const int IR_PIN = 4;
const int LED_PIN = 13;

void setup() {
  Serial.begin(9600);
  pinMode(IR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int detected = digitalRead(IR_PIN);
  if (detected == LOW) { // Active LOW
    Serial.println("ALERT: Obstacle detected within range!");
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.println("Path Clear.");
    digitalWrite(LED_PIN, LOW);
  }
  delay(300);
}`
  },
  {
    id: 'hall-sensor',
    title: 'Magnetic Hall Sensor',
    subtitle: 'Linear magnetic field detection for motors and switches',
    category: 'Motion & Proximity',
    icon: 'explore',
    imagePath: 'assets/images/blegateway.png',
    productSlug: 'linear-magnetic-hall-sensor',
    datasheetKey: 'HallSensor',
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'power', defaultWireColor: '#ef4444', suggestedMcuPin: '5V', x: 25, y: 100 },
      { id: 'gnd', name: 'GND', type: 'ground', defaultWireColor: '#1e293b', suggestedMcuPin: 'GND', x: 50, y: 100 },
      { id: 'out', name: 'AOUT', type: 'analog', defaultWireColor: '#f97316', suggestedMcuPin: 'A2', x: 75, y: 100 },
    ],
    defaultValues: { gauss: 0 },
    controls: [
      { key: 'gauss', label: 'Magnetic Field Strength', type: 'slider', min: -800, max: 800, step: 20, unit: 'Gauss' }
    ],
    readFormula: (vals) => {
      // 512 is 0 Gauss (quiescent voltage 2.5V)
      const raw = Math.round(512 + (vals.gauss / 800) * 512);
      return {
        analogVal: Math.max(0, Math.min(1023, raw)),
        serialString: `[Hall Sensor] Raw ADC: ${raw} | Strength: ${vals.gauss} G (${vals.gauss > 0 ? 'North Pole' : 'South Pole'})`
      };
    },
    sampleCode: `// CPS Lab - Linear Hall Effect Sensor
const int HALL_PIN = A2;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int rawValue = analogRead(HALL_PIN);
  // Center is ~512 at 2.5V
  int magneticField = (rawValue - 512);

  Serial.print("Magnetic Field Intensity: ");
  Serial.print(magneticField);
  Serial.println(" units");
  delay(500);
}`
  },
  {
    id: 'relay-module',
    title: 'CPS Relay Switch',
    subtitle: 'Electromagnetically operated automation power switch',
    category: 'Actuators',
    icon: 'toggle_on',
    imagePath: 'assets/images/blegateway.png',
    productSlug: 'relay-electrical-switch',
    datasheetKey: 'Relay',
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'power', defaultWireColor: '#ef4444', suggestedMcuPin: '5V', x: 25, y: 100 },
      { id: 'gnd', name: 'GND', type: 'ground', defaultWireColor: '#1e293b', suggestedMcuPin: 'GND', x: 50, y: 100 },
      { id: 'in', name: 'IN (Trigger)', type: 'digital', defaultWireColor: '#0ea5e9', suggestedMcuPin: '7', x: 75, y: 100 },
    ],
    defaultValues: { state: false },
    controls: [
      { key: 'state', label: 'Relay Active State', type: 'toggle' }
    ],
    readFormula: (vals) => ({
      digitalVal: vals.state,
      serialString: `[Relay Switch] State: ${vals.state ? '⚡ CLOSED (CIRCUIT ON)' : '⚪ OPEN (CIRCUIT OFF)'}`
    }),
    sampleCode: `// CPS Lab - 5V Relay Control
const int RELAY_PIN = 7;

void setup() {
  Serial.begin(9600);
  pinMode(RELAY_PIN, OUTPUT);
}

void loop() {
  Serial.println("Activating Relay (Switch ON)...");
  digitalWrite(RELAY_PIN, HIGH);
  delay(2000);

  Serial.println("Deactivating Relay (Switch OFF)...");
  digitalWrite(RELAY_PIN, LOW);
  delay(2000);
}`
  },
  {
    id: 'buzzer-module',
    title: 'CPS Buzzer Module',
    subtitle: 'Compact audio and alarm signaling device',
    category: 'Actuators',
    icon: 'volume_up',
    imagePath: 'assets/images/blegateway.png',
    productSlug: 'buzzer-signaling-device',
    datasheetKey: 'Buzzer',
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'power', defaultWireColor: '#ef4444', suggestedMcuPin: '5V', x: 25, y: 100 },
      { id: 'gnd', name: 'GND', type: 'ground', defaultWireColor: '#1e293b', suggestedMcuPin: 'GND', x: 50, y: 100 },
      { id: 'io', name: 'I/O (Beep)', type: 'digital', defaultWireColor: '#ec4899', suggestedMcuPin: '8', x: 75, y: 100 },
    ],
    defaultValues: { isBeeping: false, frequency: 1000 },
    controls: [
      { key: 'isBeeping', label: 'Buzzer Active (Sound ON)', type: 'toggle' },
      { key: 'frequency', label: 'Tone Pitch', type: 'slider', min: 200, max: 4000, step: 50, unit: 'Hz' }
    ],
    readFormula: (vals) => ({
      digitalVal: vals.isBeeping,
      serialString: `[Buzzer Module] Status: ${vals.isBeeping ? `🔔 BEEPING at ${vals.frequency} Hz` : 'Silent'}`
    }),
    sampleCode: `// CPS Lab - Buzzer Alarm Siren
const int BUZZER_PIN = 8;

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  Serial.println("Sounding Alarm Tone...");
  tone(BUZZER_PIN, 1000); // 1kHz tone
  delay(800);
  noTone(BUZZER_PIN);
  delay(800);
}`
  }
];
