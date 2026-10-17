import { WireConnection } from '../components/WiresLayer';

export function generateArduinoSketch(
  placedComponents: any[],
  wires: WireConnection[],
  projectTitle: string = 'CPS Circuit Project'
): string {
  const mcu = placedComponents.find((c) => c.type === 'mcu');
  const sensors = placedComponents.filter((c) => c.type === 'sensor' && c.sensorDef);
  const discretes = placedComponents.filter((c) => c.type === 'discrete');

  const includes = new Set<string>();
  const defines: string[] = [];
  const globals: string[] = [];
  const setupLines: string[] = ['  Serial.begin(9600);', '  Serial.println("=== CPS Lab Embedded System Ready ===");'];
  const loopLines: string[] = [];

  // Check for I2C devices
  const hasI2C =
    sensors.some((s) => s.sensorDef.pins.some((p: any) => p.type === 'i2c')) ||
    discretes.some((d) => d.discreteType === 'lcd');

  if (hasI2C) {
    includes.add('#include <Wire.h>');
  }

  // Check LCD
  const lcd = discretes.find((d) => d.discreteType === 'lcd');
  if (lcd) {
    includes.add('#include <LiquidCrystal_I2C.h>');
    globals.push('LiquidCrystal_I2C lcd(0x27, 16, 2);');
    setupLines.push('  lcd.init();', '  lcd.backlight();', '  lcd.setCursor(0, 0);', '  lcd.print("CPS Lab Online");');
    loopLines.push('  // Update LCD Display');
    loopLines.push('  lcd.setCursor(0, 1);');
    loopLines.push('  lcd.print("Sensors Active  ");');
  }

  // Check LEDs
  discretes
    .filter((d) => d.discreteType === 'led')
    .forEach((led, idx) => {
      const pinDefName = `LED_PIN_${idx + 1}`;
      // find connected wire
      const wire = wires.find(
        (w) =>
          (w.to.id.startsWith(`${led.instanceId}:anode`) && w.from.id.startsWith('mcu:')) ||
          (w.from.id.startsWith(`${led.instanceId}:anode`) && w.to.id.startsWith('mcu:'))
      );
      const mcuPin = wire
        ? wire.to.id.startsWith('mcu:')
          ? wire.to.id.replace('mcu:', '')
          : wire.from.id.replace('mcu:', '')
        : '13';

      defines.push(`const int ${pinDefName} = ${mcuPin};`);
      setupLines.push(`  pinMode(${pinDefName}, OUTPUT);`);
      loopLines.push(`  digitalWrite(${pinDefName}, HIGH); // Blink LED`);
    });

  // Check Sensors
  sensors.forEach((s) => {
    const sDef = s.sensorDef;
    if (sDef.id === 'rain-gauge') {
      defines.push('const int RAIN_INTERRUPT_PIN = 2;');
      globals.push('volatile int rainBucketTips = 0;');
      globals.push('void onRainBucketTip() { rainBucketTips++; }');
      setupLines.push('  pinMode(RAIN_INTERRUPT_PIN, INPUT_PULLUP);');
      setupLines.push('  attachInterrupt(digitalPinToInterrupt(RAIN_INTERRUPT_PIN), onRainBucketTip, FALLING);');
      loopLines.push('  Serial.print("Rain Gauge Tips: "); Serial.println(rainBucketTips);');
    } else if (sDef.id === 'ir-sensor') {
      defines.push('const int IR_SENSOR_PIN = 4;');
      setupLines.push('  pinMode(IR_SENSOR_PIN, INPUT);');
      loopLines.push('  int obstacle = digitalRead(IR_SENSOR_PIN);');
      loopLines.push('  if (obstacle == LOW) Serial.println("IR: Obstacle Detected!");');
    } else if (sDef.id === 'relay-module') {
      defines.push('const int RELAY_PIN = 7;');
      setupLines.push('  pinMode(RELAY_PIN, OUTPUT);');
      loopLines.push('  digitalWrite(RELAY_PIN, HIGH); // Relay Activated');
    } else if (sDef.id === 'buzzer-module') {
      defines.push('const int BUZZER_PIN = 8;');
      setupLines.push('  pinMode(BUZZER_PIN, OUTPUT);');
      loopLines.push('  tone(BUZZER_PIN, 1000, 150); // Sound 1kHz beep');
    } else if (sDef.id === 'lux-sensor') {
      loopLines.push('  Serial.println("[Lux Sensor] Polling ambient illumination (lx)...");');
    } else if (sDef.id === 'bme680') {
      loopLines.push('  Serial.println("[BME680] Polling Temp/Hum/Pres/Gas via I2C...");');
    } else if (sDef.id === 'hall-sensor') {
      defines.push('const int HALL_PIN = A2;');
      setupLines.push('  pinMode(HALL_PIN, INPUT);');
      loopLines.push('  int hallRaw = analogRead(HALL_PIN);');
      loopLines.push('  Serial.print("Magnetic Field (ADC): "); Serial.println(hallRaw);');
    } else {
      loopLines.push(`  // Polling data for ${sDef.title}`);
      loopLines.push(`  Serial.println("[Telemetry] ${sDef.title} active.");`);
    }
  });

  if (loopLines.length === 0) {
    loopLines.push('  // Read sensors and update outputs');
    loopLines.push('  Serial.println("Polling hardware bus...");');
  }

  loopLines.push('  delay(1000); // Sampling interval');

  let output = `// =============================================================\n`;
  output += `// CPS TINKERING LAB - ARDUINO FIRMWARE EXPORT\n`;
  output += `// Project: ${projectTitle}\n`;
  output += `// Microcontroller: ${mcu ? mcu.title : 'Arduino Uno (ATmega328P)'}\n`;
  output += `// Connected Components: ${placedComponents.length}\n`;
  output += `// Total Wires: ${wires.length}\n`;
  output += `// =============================================================\n\n`;

  if (includes.size > 0) {
    output += Array.from(includes).join('\n') + '\n\n';
  }

  if (defines.length > 0) {
    output += '// Pin Assignments\n' + defines.join('\n') + '\n\n';
  }

  if (globals.length > 0) {
    output += '// Global Variables & Objects\n' + globals.join('\n') + '\n\n';
  }

  output += 'void setup() {\n';
  output += setupLines.join('\n') + '\n';
  output += '}\n\n';

  output += 'void loop() {\n';
  output += loopLines.join('\n') + '\n';
  output += '}\n';

  return output;
}
