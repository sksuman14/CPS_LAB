import 'dart:io';
import '../utils/access_control.dart';
import "download.dart";
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'dart:html' as html;
import 'package:archive/archive.dart';


final List<Map<String, dynamic>> allSensors = [
  {
    "title": "Data ",
    "highlightText": "Logger",
    "subtitle": "Reliable Data Logging & seamless Connectivity",
    "bannerPoints": [
      "4G Dual sim With multi protocol Support",
      "Advance power management with solar charging",
      "Robust Design with IP66 Rating.",
    ],
    "features": [
      "4G Dual sim connectivity",
      "25-30 Days Data Backup",
      "Support Multi protocol communication Interfaces",
      "Robust IP66 Enclosure for harsh weather condition",
      "Solar and Battery Powered option for remote site.",
    ],
    "applications": [
      "Remote weather monitoring stations",
      "Smart agriculture and irrigation management",
      "Industrial and environmental monitoring",
      "Smart cities and IoT projects",
      "Cold storage management",
    ],
    "specifications": [
      "Input Supply voltage: 5V - 16",
      "Communication interfaces: ADC, UART, I2C, SPI, RS232, RS485",
      "Data Support: HTTP, HTTPS, MQTT, FTP",
      "Flexible Power input options : USB Type C or LiIon Battery",
      "Support SD card",
      "Built in LTE and GPS Antennas",
      "Inbuild Real Time clock",
      "Ultra low power sleep mode",
    ],
    "imagePath": "assets/images/dataloggerrender.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "DataLogger",
  },
  // gATEWAY
  {
    "title": "BLE",
    "highlightText": "Gateway",
    "subtitle": "BLE Gateway For industrial IoT Applications",
    "bannerPoints": [
      "Multi-Industry IoT Gateway Solution",
      "Real-Time Data Aggregation",
      "Scalable Gateway for 100+ nodes",
    ],
    "features": [
      "Real Time Monitoring with low power consumptions",
      "FOTA (Firmware Over the Air)",
      "Supports 100+ nodes with BLE range up to 1 km Line of sight",
      "IP66 & Compact design",
      "Connectivity option: 4G, WIFI, LAN",
    ],
    "applications": [
      "Smart Agriculture & Precision farming",
      "Logistics and asset tracking",
      "Industrial equipment and health monitoring",
      "Healthcare wearable data collections",
      "Home Automations and energy management",
    ],
    "specifications": [
      "Input Voltage Range : 5 - 30 v",
      "On board led indications for networking , cloud and BLE connectivity.",
      "Processor : Dual- Core Arm Cortex-M33.",
      "Controller used is nrf5340.",
      "Bluetooth version: BLE 5.4",
      "On board flash memory, sd card slot, MIC , sim card, gsm and BLE Antenna.",
      "Support Multiple Communications protocol such as SPI,I2C,I2S,UART etc.",
      "Integrated with both battery and solar panel.",
      "512KB RAM +1MB Flash",
    ],
    "imagePath": "assets/images/blegateway.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "Gateway",
  },
  {
    "title": "STTS751",
    "highlightText": "Temperature Sensor",
    "subtitle": " Programmable resolution and low power consumption",
    "bannerPoints": [
      "I²C and SMBus 2.0 compatible digital temperature sensor",
      "Programmable resolution from 9-bit to 12-bit",
      "Built-in alarm function with EVENT output",
    ],
    "features": [
      "Digital temperature sensor with I²C communication",
      "Programmable resolution for flexible performance",
      "Built-in alarm function with EVENT output",
      "Very low power consumption, ideal for portable devices",
      "Compact package, easy to integrate into systems",
    ],
    "applications": [
      "Weather Monitoring Systems",
      "Automotive Electronics",
      "Telecom Equipment",
      "Consumer Electronics",
      "Power Electronics",
    ],
    "specifications": [
      "Operating Voltage: 2.25 V to 3.6 V",
      "Operating Temperature Range: -40 °C to +125 °C",
      "Selectable Conversion Rates: 0.0625 to 32 conversions/second",
      "Default Conversion Rate: 1 conversion/second",
      "Resolution Options: 9-bit (0.5 °C/LSB), 10-bit (0.25 °C/LSB), 11-bit (0.125 °C/LSB), 12-bit (0.0625 °C/LSB)",
      "Supply Current: 50 µA @ 8 conversions/s, 20 µA @ 1 conversion/s, 3 µA standby",
      "Accuracy: ±0.5 °C (0 °C to +85 °C), ±0.5 °C (-40 °C to +125 °C)",
    ],
    "imagePath": "assets/images/stts751.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "STTS751",
    "nreCodeLink":
        "https://github.com/sksuman14/nRF_All_Sensors_Codes/tree/main/All_Temperature_Sensors/STTS751_Sensor",
    "quecCodeLink":
        "https://github.com/sksuman14/QuecPython_All_Sensors_Codes/tree/main/STTS751_Temperature_Sensor/STTS751",
  },
  {
    "title": "LIS3DH",
    "highlightText": "Motion Sensor",
    "subtitle":
        "Compact and efficient accelerometer for motion detection and orientation sensing",
    "bannerPoints": [
      "Ultra-low power 3-axis accelerometer for battery-powered devices",
      "Supports I2C and SPI digital interfaces",
      "Built-in FIFO buffer for reduced processor load",
    ],
    "features": [
      "Ultra-low power 3-axis accelerometer – ideal for battery-powered devices",
      "Multiple motion detection functions – free-fall, tap/click, activity, and orientation",
      "Flexible performance – supports both high-resolution and low-power modes",
      "Built-in FIFO buffer – reduces processor load and saves power",
      "Compact LGA package – small size (3 × 3 × 1 mm) for wearables and mobile devices",
    ],
    "applications": [
      "Motion activated functions",
      "Free-fall detection",
      "Display orientation",
      "Gaming and virtual reality input devices",
      "Impact recognition and logging",
    ],
    "specifications": [
      "Wide supply voltage: 1.71V to 3.6V",
      "Operating temperature range: -40°C to +85°C",
      "Independent IO supply (1.8V) and supply voltage compatible",
      "Ultra-low-power mode consumption down to 2 µA",
      "I2C/SPI digital output interface",
      "16-bit data output",
      "2 independent programmable interrupt generators",
      "Embedded 32 levels of 16-bit data output FIFO",
      "Free-fall and motion detection",
      "10000 g high shock survivability",
      "Measurement range (selectable): ±2g / ±4g / ±8g / ±16g",
      "I2C logic: Address jumper for 0x18 or 0x19, pull-up enable for VCC",
    ],
    "imagePath": "assets/images/lis3dh.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "LIS3DH",
    "nreCodeLink":
        "https://github.com/sksuman14/nRF_All_Sensors_Codes/tree/main/LIS3DH_Sensor/lis3dhSensor",
  },
  {
    "title": "W25Q16 / W25Q32",
    "highlightText": "Memory Board",
    "subtitle": "Compact, low-power, high-speed storage solution.",
    "bannerPoints": [
      "High-speed SPI interface with Standard, Dual, and Quad I/O",
      "Low power consumption with wide voltage range (2.7V to 3.6V)",
      "Compact packaging ideal for space-saving embedded applications",
    ],
    "features": [
      "High-speed SPI interface supporting Standard, Dual, and Quad modes for faster data transfer",
      "Ultra-low power operation with ~5 mA active current and ~1 µA in standby mode",
      "Wide 2.7V–3.6V voltage range, optimized for battery-powered applications",
      "Flexible architecture for code shadowing, XIP (execute-in-place), and storage of voice, text, and data",
      "Compact, space-saving packages ideal for embedded systems",
    ],
    "applications": [
      "Embedded and IoT systems – storing firmware, configuration, and application data",
      "Consumer electronics – TVs, cameras, set-top boxes, and gaming consoles",
      "Mobile and networking devices – smartphones, tablets, routers, and modems",
      "Automotive and industrial electronics – dashboards, ADAS, PLCs, and monitoring systems",
      "Medical, audio, and PC peripherals – diagnostics tools, sound storage, printers, SSD controllers, and BIOS",
    ],
    "specifications": [
      "High-speed SPI up to 104 MHz with Standard, Dual, and Quad I/O",
      "Execute-In-Place (XIP) enabling direct code execution from flash",
      "256-byte page memory with multiple erase sizes (4 KB, 32 KB, 64 KB, full chip)",
      "Low power operation with 2.7–3.6V supply, ~5 mA active, and <1 µA standby",
      "Fast program/erase (~1.5 ms per page, ~120 ms per sector) with suspend/resume support",
      "High endurance with 100,000+ erase/program cycles",
      "Data retention exceeding 20 years",
      "Integrated security features – OTP area, block protection, and unique 64-bit ID",
    ],
    "imagePath": "assets/images/memory.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "W25QXX",
    "nreCodeLink":
        "https://github.com/sksuman14/nRF_All_Sensors_Codes/tree/main/MX25r6435_and_W25q16dv_SPI_FLash",
  },
  {
    "title": "Buzzer",
    "highlightText": "Signaling Device",
    "subtitle": "Compact audio signaling component.",
    "bannerPoints": [
      "Generates alarms, beeps, and melodies with simple DC power",
      "Small, solid design suitable for breadboards and PCBs",
    ],
    "features": [
      "Simple 3-pin interface (VDD, GND, control signal) for easy connection",
      "Microcontroller-compatible, directly driven by digital I/O (PWM for tones)",
      "Stable operation with internal driver ensuring consistent sound output",
      "Compact, small-size design suitable for breadboards and PCB integration",
      "Versatile sound output capable of alarms, beeps, and melody generation",
    ],
    "applications": [
      "Alarms & security systems – intruder, smoke, or fire detection alerts",
      "User interface feedback – confirmation tones in electronic devices",
      "Timers & reminders – used in kitchen timers and home appliances",
      "Consumer electronics – printers, computers, and notification systems",
      "Industrial and embedded projects – audio signaling in automation and control",
    ],
    "specifications": [
      "Rated Voltage: 3.5V",
      "Operating Voltage Range: 2.5V to 6.0V",
      "Mean Current: 35mA (Max)",
      "Peak Current: 105mA (Max)",
      "Direct Current Resistance: 42 ± 6.3Ω",
      "Sound Output: 85dBA (Min)",
      "Rated Frequency: 2048 Hz",
      "Compact design optimized for embedded and portable devices",
    ],
    "imagePath": "assets/images/buzzer.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "BUZZER",
    "nreCodeLink":
        "https://github.com/sksuman14/nRF_All_Sensors_Codes/tree/main/Buzzer",
  },
  {
    "title": "Relay",
    "highlightText": "Electrical Switch",
    "subtitle":
        "Electromagnetically operated switch for automation and control",
    "bannerPoints": [
      "Electrically operated switch with multiple contacts",
      "Works on electromagnetic attraction principle",
      "Supports safe isolation between control and load",
    ],
    "features": [
      "Coil Voltage: 5 V DC operation",
      "High Switching Capacity: Supports up to 10 A at 250 V AC / 30 V DC",
      "Compact PCB mountable design",
      "Galvanic Isolation for safety",
      "Widely compatible with microcontrollers using driver circuitry",
    ],
    "applications": [
      "Home automation – switching lights, fans, or appliances",
      "Industrial control – motor control, pumps, and machinery",
      "Smart IoT systems – relay-controlled automation projects",
      "Power electronics – switching high-power loads safely",
      "General automation – fault sensing and protection circuits",
    ],
    "specifications": [
      "Coil Voltage: 5 V DC (Nominal)",
      "Coil Resistance: ~70 Ω (±10%)",
      "Contact Rating: 10 A @ 250 V AC or 10 A @ 30 V DC",
      "Contact Arrangement: SPDT (Single Pole Double Throw)",
      "Mechanical Life: ≥10 million operations",
      "Electrical Life: ≥100,000 operations",
    ],
    "imagePath": "assets/images/relay.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "RELAY",
    "nreCodeLink":
        "https://github.com/sksuman14/nRF_All_Sensors_Codes/tree/main/Relay",
  },
  {
    "title": "Bluetooth Low Energyt",
    "highlightText": "Development Kit",
    "subtitle":
        "Multi-protocol wireless prototyping kit for IoT and smart devices",
    "bannerPoints": [
      "Supports Bluetooth Low Energy, Mesh, ANT, and 2.4 GHz",
      "Arduino Uno Rev. 3 compatible for prototyping",
      "Includes on-board SEGGER J-Link debugger",
    ],
    "features": [
      "Rapid prototyping board tailored for IoT and wireless applications",
      "Multi-protocol support: Bluetooth LE, Bluetooth Mesh, ANT, proprietary 2.4 GHz",
      "Enhanced Bluetooth 5 capability with higher throughput and extended advertising",
      "User-friendly design with 4 programmable buttons and 4 LEDs",
      "Plug-and-play compatibility with Arduino Uno Rev. 3 shields",
      "On-board SEGGER J-Link debugger for seamless development",
      "External SoC programming and debugging via dedicated header",
      "Integrated antenna for stable wireless performance",
      "Flexible powering options: USB, external supply, or CR2032 battery",
      "Compatible with IDEs like SEGGER Embedded Studio, Visual Studio, Keil, GCC, and IAR",
    ],
    "applications": [
      "IoT Devices – Smart home hubs, connected sensors, automation controllers",
      "Wearables – Fitness trackers, health monitors, smartwatches",
      "Smart Lighting – Professional and consumer-grade wireless lighting systems",
      "Industrial Monitoring – Asset tracking, predictive maintenance, sensor logging",
      "Environmental Monitoring – Air quality, weather stations, smart agriculture",
      "Wireless Audio – LE Audio prototypes and Bluetooth-based sound systems",
      "Healthcare Devices – Medical wearables and patient monitoring solutions",
      "Automotive Applications – Vehicle diagnostics, tracking, infotainment",
      "Educational Development – Training kits, student projects, prototyping platforms",
      "Smart Infrastructure – Building automation and energy management systems",
    ],
    "specifications": [
      "Processor: Arm Cortex-M4F @ 64 MHz with FPU and DSP instructions",
      "Memory: 512 kB Flash, 64 kB RAM (on-chip)",
      "Connectivity: Bluetooth 5, ANT, 2.4 GHz proprietary",
      "Interfaces: GPIO, UART, SPI, I²C, ADC, PWM routed to edge connectors",
      "Debugging Interface: SEGGER J-Link OB with SWD support",
      "Power Supply Voltage: 1.7 V – 3.3 V (USB, external supply, CR2032 battery)",
      "Antenna: 2.4 GHz PCB trace antenna",
      "Form Factor: Arduino Uno Rev. 3 layout (~68 mm × 52 mm)",
      "User I/O: 4 LEDs and 4 push-buttons",
      "Operating Conditions: -40°C to +85°C (industrial grade)",
    ],
    "imagePath": "assets/images/ble_dev_kit.jpg",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "BLEKIT",
      "nreCodeLink":
        "https://github.com/sksuman14/nRF_All_Sensors_Codes/tree/main/Blink_Led/Led_Blink",
     },
  {
    "title": "BLE",
    "highlightText": "Node",
    "subtitle":
        "Advanced Bluetooth LE solution for IoT and wearable applications",
    "bannerPoints": [
      "Equipped with NRF52832 microcontroller",
      "Supports Bluetooth LE and proprietary 2.4 GHz",
      "Ultra-low power consumption",
    ],
    "features": [
      "Multiprotocol support with advanced Bluetooth LE",
      "High-performance processor for complex applications",
      "Generous memory for demanding IoT and wearable use cases",
      "NFC-A tag for easy pairing and payments",
      "Rich peripherals including audio interfaces",
      "Ultra-low power with adaptive management",
    ],
    "applications": [
      "Ideal for building low-power wireless devices for IoT networks",
      "Suitable for fitness trackers and health monitoring devices",
      "Used in creating location-based services and remote controls",
      "Can be integrated into smart building systems for lighting and HVAC",
      "Used in devices that transmit patient data like heart rate and blood oxygen",
      "Supports activity levels to healthcare providers remotely",
    ],
    "specifications": [
      "2.4 GHz RF transceiver with Bluetooth LE support, 2 Mbps throughput",
      "Concurrent multiprotocol operation for BLE, Bluetooth Mesh, and proprietary 2.4 GHz",
      "Integrated NFC-A tag for secure pairing and data exchange",
      "ARM Cortex-M4 processor with hardware FPU and DSP extensions",
      "Configurable memory variants: up to 512 kB Flash and 64 kB RAM",
      "Operating voltage range: 1.7 V - 3.6 V",
    ],
    "imagePath": "assets/images/bleNode.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "BLENODE",
  },
  {
    "title": "Flash Tool",
    "highlightText": "Development, Programming, and Debugging Tool",
    "subtitle": "Designed for nRF series SoCs.",
    "bannerPoints": [
      "Broad compatibility with nRF series SoCs",
      "Seamless firmware programming and bootloader updates",
      "Reliable debugging with real-time code inspection",
    ],
    "features": [
      "Broad compatibility with multiple nRF series SoCs for flexible development",
      "Seamless firmware programming, bootloader updates, and device configuration",
      "Reliable debugging with real-time code inspection and error tracking",
      "Cross-platform usability for developers on different systems",
      "Smooth integration with Nordic SDKs and supporting tools",
      "User-friendly operation suitable for beginners and advanced developers",
    ],
    "applications": [
      "Firmware Development: Writing and deploying firmware",
      "Debugging: Tools to debug and troubleshoot firmware issues for efficient bug fixing",
      "Testing: Facilitating testing of wireless applications to meet required specifications",
      "Production Programming: Programming multiple devices in manufacturing environments ",
      "Bootloader Updates: Updating bootloaders on nRF devices to support new features or fix issues",
      "Configuration: Setting device parameters, calibrating sensors, and adjusting wireless settings",
    ],
    "specifications": [
      "Supported Devices: Compatibility with nRF51, nRF52, nRF53 series SoCs",
      "Programming Interface: JTAG, SWD (Serial Wire Debug), or USB",
      "Software Compatibility: Support for IDEs like SEGGER Embedded Studio, Keil",
      "Operating System Support: Windows, macOS, and Linux",
      "Programming Modes: Flash firmware, update bootloaders, and configure device settings",
      "Debugging Capabilities: Breakpoints, single-stepping, and memory/register inspection",
      "Integration: Works with nRF Connect SDK, Command Line Tools, and nRF Connect ",
      "Enhanced Workflow: Breakpoint control and stepwise debugging for efficiency",
    ],
    "imagePath": "assets/images/programmer.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "FLASHTOOL",
  },
  {
    "title": "BME680",
    "highlightText": " Temperature, Humidity, Pressure and Gas Sensor",
    "subtitle":
        "Compact 4-in-1 environmental sensor for IoT and air quality monitoring",
    "bannerPoints": [
      "Integrated 4-in-1 sensing: gas, pressure, humidity, temperature",
      "Supports I2C and SPI digital interfaces",
      "Low power consumption for battery-powered devices",
    ],
    "features": [
      "Integrated 4-in-1 environmental sensor (gas, pressure, humidity, temperature)",
      "Provides Indoor Air Quality (IAQ) index output",
      "Supports I2C and SPI digital interfaces for flexible integration",
      "Designed for ultra-low power consumption in battery devices",
      "Compact 3.0 × 3.0 × 0.93 mm package for space-saving integration",
      "Fast response time for real-time environmental monitoring",
    ],
    "applications": [
      "Indoor Air Quality monitoring in smart homes and offices",
      "Home automation and IoT-based environmental control",
      "Weather forecasting and environmental sensing",
      "GPS enhancement through pressure-based altitude estimation",
      "Wearable devices for health and fitness tracking",
      "Smart appliances with environment-based adaptive features",
    ],
    "specifications": [
      "Package: 3.0 mm × 3.0 mm × 0.93 mm, metal lid LGA",
      "Digital Interfaces: I2C (up to 3.4 MHz), SPI (3/4-wire up to 10 MHz)",
      "Supply Voltage: VDD 1.71V–3.6V, VDDIO 1.2V–3.6V",
      "Operating Range: -40°C to +85°C; Humidity 0–100% r.H.; Pressure 300–1100 hPa",
      "Current Consumption: 2.1 µA @1Hz (humidity+temperature), 3.1 µA @1Hz ",
      "Gas Sensor: Response <1s, IAQ index output, power <0.1mA ultra-low mode",
      "Humidity Sensor: Response ~8s, accuracy ±3% r.H., hysteresis ±1.5% r.H.",
      "Pressure Sensor: RMS noise 0.12 Pa (~1.7 cm), offset coefficient ±1.3 Pa/K",
    ],
    "imagePath": "assets/images/bme680.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "BME680",
    "nreCodeLink":
        "https://github.com/sksuman14/nRF_All_Sensors_Codes/tree/main/BME680_Sensor",
    "quecCodeLink":
        "https://github.com/sksuman14/QuecPython_All_Sensors_Codes/tree/main/BME680",
  },
  {
    "title": "Activity/Vibration",
    "highlightText": "Monitor Kit",
    "subtitle":
        "Real-time motion and environmental data tracker for STEM and IoT projects",
    "bannerPoints": [
      "3-axis accelerometer for real-time motion tracking",
      "Bluetooth Low Energy (BLE) connectivity for mobile and PC",
      "Compact, low-power, portable, and wearable design",
    ],
    "features": [
      "Real-time motion tracking with high-precision accelerometer",
      "Seamless Bluetooth Low Energy (BLE) connectivity",
      "Compact, low-power design ideal for wearables",
      "Supports experiments like pendulum motion, velocity, and step counting",
      "Multiple communication interfaces (PC, SPI, UART) for easy integration",
    ],
    "applications": [
      "Physics Experiments – Pendulum motion, harmonic oscillation, gravity, and acceleration studies",
      "Step Counting – Pedometer creation for detecting and counting steps",
      "Velocity Measurement – Track acceleration over time and calculate velocity",
      "Speed Monitoring – Real-time speed measurement using accelerometer data",
      "Environmental Monitoring – Measure motion/vibration data for STEM and IoT projects",
    ],
    "specifications": [
      "Controller: Nordic nRF52832 SoC, ARM Cortex-M4F, 64 MHz",
      "Memory: 512 KB Flash, 64 KB RAM",
      "Accelerometer: LIS3DH, 3-axis, ±2g/±4g/±8g/±16g, 12-bit resolution",
      "Wireless: Bluetooth Low Energy (BLE 4.2 / 5.0 compatible)",
      "Interfaces: PC, SPI, UART",
      "Operating Voltage: 1.7 V – 3.6 V",
      "Form Factor: Compact, battery-powered design for portable use",
      "Use Case: Suitable for STEM education, wearable projects, and IoT applications",
    ],
    "imagePath": "assets/images/Actitvity.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "ACTIVITY",
        "nreCodeLink":
        "https://github.com/sksuman14/nRF_All_Sensors_Codes/tree/main/LIS3DH_Data_OnMobileApp",

  },
  {
    "title": "Lux ",
    "highlightText": "Sensor",
    "subtitle":
        "16-bit resolution sensor for consumer and industrial applications",
    "bannerPoints": [
      "Integrated ambient light and proximity sensing",
      "High sensitivity for accurate light and object detection",
      "Low power consumption optimized for portable devices",
    ],
    "features": [
      "Combined ambient light and proximity sensing in a compact package",
      "High sensitivity for precise detection of objects and light levels",
      "Wide detection range suitable for consumer and industrial use",
      "Low power consumption ideal for battery-powered devices",
      "I²C interface for easy integration with microcontrollers",
    ],
    "applications": [
      "Smartphones & Tablets – Auto brightness control and proximity sensing during calls",
      "Wearables – Gesture recognition and display power-saving control",
      "Consumer Electronics – Adaptive brightness and touchless control",
      "Industrial Systems – Light level monitoring and automation",
      "IoT Devices – Smart lighting, energy management, and sensor-based systems",
    ],
    "specifications": [
      "Proximity Sensor Range: Up to 200 mm with sunlight immunity",
      "Ambient Light Sensor Range: 0.0125 lux to 20,000 lux (16-bit resolution)",
      "Supply Voltage: 2.5 V to 3.6 V",
      "Communication Interface: I²C, up to 400 kHz",
      "Package Type: 8-pin lead-free compact surface-mount package",
      "Operating Temperature: -40°C to +85°C",
      "Current Consumption: ~80 µA (ALS), ~200 µA (Proximity), <1 µA (Shutdown Mode)",
      "Form Factor: Miniature package (6.8 × 3.0 × 2.5 mm)",
    ],
    "imagePath": "assets/images/lux.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "LUX",
    "nreCodeLink":
        "https://github.com/sksuman14/nRF_All_Sensors_Codes/tree/main/VCNL4040_LuxSensor",
    "quecCodeLink":
        "https://github.com/sksuman14/QuecPython_All_Sensors_Codes/tree/main/VEML7700",
  },
  {
    "title": "Groove ",
    "highlightText": "Shield",
    "subtitle":
        "Easy integration of sensors, actuators, and inputs for rapid IoT prototyping",
    "bannerPoints": [
      "Plug-and-play modular system for rapid prototyping",
      "Standardized Grove 4-pin interface for sensors and modules",
      "Compatible with BLE development kits and Arduino ecosystem",
    ],
    "features": [
      "Plug-and-play modular system for quick sensor and module integration",
      "Standardized Grove interface with 4-pin connectors.",
      "Compatible with BLE development kits for simplified prototyping",
      "No soldering required, enabling faster project development",
      "Scalable design supporting multiple Grove modules simultaneously",
    ],
    "applications": [
      "Rapid Prototyping – Quickly test sensors, actuators, and wireless modules",
      "IoT Development – Connect BLE-enabled boards with Grove sensors",
      "Wearables & Health Monitoring – Integrate bio-sensors with BLE kits",
      "STEM Education & Learning – Teaching electronics and IoT concepts",
      "Smart Systems – Build scalable automation and monitoring solutions",
    ],
    "specifications": [
      "Operating Voltage: 3.3 V / 5 V (depends on development kit)",
      "Interfaces: Digital, Analog, I²C, UART via Grove connectors",
      "Connector Type: Standard 4-pin Grove headers",
      "Compatibility: Works with Arduino, BLE kits, and Seeed Studio Grove ecosystem",
      "Form Factor: Shield/hat design for easy stacking on development boards",
      "Prototyping Support: Simplifies modular prototyping without soldering",
      "Design: Compact and scalable for multiple module connections",
      "Use Case: Ideal for rapid IoT prototyping and educational projects",
    ],
    "imagePath": "assets/images/groove.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "GROOVE",
    "nreCodeLink":
        "https://github.com/sksuman14/nRF_All_Sensors_Codes/tree/main/Grove_16x2Lcd",
  },
  {
    "title": "TLV493D",
    "highlightText": "3D Magnetic Sensor",
    "subtitle":
        "High precision Hall-effect sensor for accurate 3D magnetic field measurement",
    "bannerPoints": [
      "True 3D magnetic sensing (X, Y, Z axes)",
      "Compact & ultra-low power design",
      "High precision 12-bit resolution",
    ],
    "features": [
      "True 3D Magnetic Sensing – Simultaneous measurement of X, Y, and Z magnetic field components",
      "Compact & Low-Power Design – Ultra-low power consumption (<10 μA) supports battery operation",
      "High Precision & Stability – 12-bit resolution ensures accurate position and angle detection",
      "Digital Interface – Fast and reliable I²C communication up to 1 MHz",
      "Versatile Applications – Suitable for automotive, robotics, gaming, and consumer electronics",
    ],
    "applications": [
      "Robotics: 3D position sensing for robotic arms and actuators",
      "Automotive: Component position detection (gear shifters, pedals, steering systems)",
      "Consumer Electronics: Gesture recognition for smart devices and touchless interfaces",
      "Gaming & AR/VR: Tilt, rotation, and motion detection in controllers and headsets",
      "Industrial & Smart Systems: Precise position sensing for automation and monitoring",
    ],
    "specifications": [
      "Operating Voltage: 2.7 V – 3.5 V (typical 3.3 V)",
      "Magnetic Field Measurement Range: ±130 mT (X, Y axes), ±180 mT (Z axis)",
      "Resolution: 12-bit for all three axes",
      "Current Consumption: ~10 μA (Ultra Low-Power Mode)",
    ],
    "imagePath": "assets/images/tlv.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "TLV",
    "nreCodeLink":
        "https://github.com/sksuman14/nRF_All_Sensors_Codes/tree/main/Tlv493d_Magnetometer",
  },
  {
    "title": "TOF VL53L0X",
    "highlightText": "Laser Distance Sensor",
    "subtitle": "Millimeter-level accuracy for precise distance measurement.",
    "bannerPoints": [
      "Up to 2m measurement range with mm-level accuracy",
      "Compact ToF sensor with fast response",
      "Low power consumption for battery-based devices",
    ],
    "features": [
      "Compact ToF Sensor: Provides precise distance measurement in a small form factor",
      "High Accuracy: Millimeter-level resolution for reliable detection",
      "Fast Response: Adjustable timing budget with measurement rates up to 50 Hz",
      "Wide Applications: Suitable for robotics, smartphones, and industrial automation",
      "Low Power Operation: Optimized for battery-powered and energy-sensitive devices",
    ],
    "applications": [
      "Obstacle Detection & Avoidance: Robotics, drones, and autonomous vehicles",
      "Proximity Sensing: Smartphones, smart home devices, and touchless controls",
      "Gesture Recognition: Smart interfaces, AR/VR, and gaming devices",
      "Laser Autofocus: Enhances focus speed and accuracy in cameras",
      "Industrial Automation: Precise distance measurement in factory equipment and safety systems",
    ],
    "specifications": [
      "Measurement Range: Up to 2 meters (with mm accuracy)",
      "Interface: I²C (standard and fast mode)",
      "Operating Voltage: 2.6V – 3.5V (typical 3.3V)",
      "Field of View (FoV): ~25°",
      "Measurement Frequency: Up to 50 Hz (configurable)",
      "Low Power Design: Optimized for energy-efficient applications",
    ],
    "imagePath": "assets/images/vl5.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "VL",
    "nreCodeLink":
        "https://github.com/sksuman14/nRF_All_Sensors_Codes/blob/main/TOFVl53l0x_Sensor",
  },
  {
    "title": "UV LTR-390 ",
    "highlightText": "Light Sensor",
    "subtitle":
        "Ideal for UV index monitoring, wearables, IoT, and healthcare applications",
    "bannerPoints": [
      "Dual sensing capability for UV and ambient light",
      "Ultra-low power consumption (~1.5 µA standby)",
      "Compact design optimized for wearables and IoT",
    ],
    "features": [
      "Dual Sensing Capability – Detects both UV intensity and ambient visible light",
      "Ultra-Low Power Design – Consumes only ~1.5 µA in standby mode",
      "Digital Interface – I²C communication with multiple address options",
      "High Sensitivity & Accuracy – Suitable for wearables and precise UV index monitoring",
      "Compact Form Factor – Optimized for integration in small IoT and portable devices",
    ],
    "applications": [
      "UV Index Monitoring – Environmental monitoring and personal UV trackers",
      "Wearables – Smartwatches, bands, and fitness trackers",
      "Automatic Brightness Control – Smartphones, tablets, and laptops",
      "IoT Devices – Smart home and connected sensing applications",
      "Healthcare & Industrial – UV safety, sterilization monitoring, and light control",
    ],
    "specifications": [
      "Operating Voltage: 1.7 V to 3.6 V",
      "Interface: I²C digital (configurable addresses)",
      "Detection Range: UV index measurement + visible light sensing",
      "Current Consumption: ~1.5 µA in standby (low-power operation)",
      "Package: Compact sensor package suitable for wearables and embedded systems",
      "Communication Support: Multiple I²C addresses for flexible integration",
    ],
    "imagePath": "assets/images/ltr390.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "UVLTR",
    "nreCodeLink":
        "https://github.com/sksuman14/nRF_All_Sensors_Codes/blob/main/UVLtr390_Sensor",
  },
  {
    "title": "Linear Magnetic Hall",
    "highlightText": "Sensor",
    "subtitle":
        "Detects magnetic fields with digital and analog outputs for automotive, industrial, and consumer applications",
    "bannerPoints": [
      "Wide voltage range operation (3.3 V – 24 V)",
      "Adjustable sensitivity with potentiometer",
      "Supports analog, digital, and PWM outputs",
    ],
    "features": [
      "Features wide range voltage comparator LM393",
      "Adjustable sensitivity with built-in potentiometer",
      "Signal output indicator with retaining bolt hole for easy installation",
      "Supports digital switch output (0 and 1 high/low level)",
      "Can be used for acoustic control light, sound alarm, and sound detection",
      "Compact sensor design with LED indication and simple wiring",
    ],
    "applications": [
      "Automotive Systems – Wheel speed sensing, gear position detection, and pedal position monitoring",
      "Motor Control – Rotor position detection in BLDC and stepper motors",
      "Consumer Electronics – Open/close detection in phones, laptops, and smart appliances",
      "Industrial Automation – Proximity sensing, machine safety interlocks, and current sensing",
      "Medical Devices – Position and movement detection in diagnostic or monitoring equipment",
      "Smart Systems – Acoustic/sound-based detection and control applications",
    ],
    "specifications": [
      "Supply Voltage (Vcc): 3.3 V to 24 V",
      "Magnetic Range: ±50 mT to ±1000 mT",
      "Output Types: Analog (voltage proportional to field strength), Digital (binary on/off), PWM (duty cycle proportional to field strength)",
      "Current Consumption: Few mA to tens of mA",
      "Sensitivity: 1 to 100 mV/mT",
      "Temperature Range: -40 °C to +150 °C",
      "Response Time: Microseconds to milliseconds",
      "Hysteresis: Few % of magnetic range; Linearity: Defined as % of full-scale output",
    ],
    "imagePath": "assets/images/halleffect.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "HALL",
  },
  {
    "title": "InfraRed ",
    "highlightText": "Sensor",
    "subtitle":
        "Detects infrared radiation emitted by objects, supporting motion detection, temperature measurement, and control systems",
    "bannerPoints": [
      "Detects infrared radiation for multiple applications",
      "Supports motion, temperature, and remote-control sensing",
      "Multiple output modes: Analog, Digital, PWM",
    ],
    "features": [
      "Detects infrared radiation for motion, temperature, and control applications",
      "Wide detection range from centimeters to several meters",
      "Supports multiple output modes (analog, digital, PWM) for flexible system integration",
      "Fast response time suitable for real-time control and monitoring",
      "Adjustable field of view for both broad coverage and narrow precision sensing",
      "Compact package options for easy integration in consumer and industrial devices",
    ],
    "applications": [
      "Motion Detection – Security systems, automatic lighting, robotics",
      "Temperature Measurement – Contactless thermometers, industrial monitoring",
      "Remote Controls – TVs, AC units, and other consumer electronics",
      "Gesture Recognition – Smart devices and interactive displays",
      "Industrial Automation – Object counting, positioning systems",
      "Automotive – Night vision systems and driver assistance sensors",
    ],
    "specifications": [
      "Operating Voltage: 3.3 V to 5 V (higher for some variants)",
      "Current Consumption: Few mA to tens of mA",
      "Detection Range: Few cm to several meters (depending on sensor type)",
      "Field of View (FOV): 30° to 180°",
      "Wavelength Range: Near-IR 700 nm – 1400 nm; Thermal IR 8 µm – 14 µm",
      "Response Time: Microseconds to milliseconds",
      "Output Types: Analog, Digital, PWM",
      "Operating Temperature: -40 °C to +85 °C",
    ],
    "imagePath": "assets/images/ir_sensor.png",
    "email": "krishnanpallavi63@gmail.com",
    "datasheetKey": "IR",
  },
];

class SimpleListItem extends StatelessWidget {
  final String text;
  final bool isDarkMode;

  const SimpleListItem({
    super.key,
    required this.text,
    required this.isDarkMode,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      elevation: 2,
      color: isDarkMode
          ? const Color.fromARGB(255, 44, 44, 44)
          : const Color.fromARGB(255, 243, 243, 243),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              Icons.check_circle,
              color: isDarkMode ? Colors.yellow.shade200 : Colors.deepPurple,
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                text,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: isDarkMode ? Colors.white70 : Colors.black87,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class HoverableCard extends StatefulWidget {
  final Widget child;
  const HoverableCard({super.key, required this.child});

  @override
  State<HoverableCard> createState() => _HoverableCardState();
}

class _HoverableCardState extends State<HoverableCard> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
        transform: Matrix4.identity()..scale(_isHovering ? 1.02 : 1.0),
        child: widget.child,
      ),
    );
  }
}

class ProductDescriptionPage extends StatelessWidget {
  final String sensorImage;
  final String? userEmail;
  const ProductDescriptionPage({
    super.key,
    required this.sensorImage,
    this.userEmail,
  });

  @override
  Widget build(BuildContext context) {
    final sensor = allSensors.firstWhere(
      (s) => s["imagePath"] == sensorImage,
      orElse: () => {
        "title": "Unknown",
        "highlightText": "",
        "subtitle": "Description not found",
        "bannerPoints": [],
        "features": [],
        "applications": [],
        "specifications": [],
        "imagePath": "",
        "email": "",
        "datasheetKey": "",
        "nreCodeLink": "",
        "quecCodeLink": "",
      },
    );

    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;

    final isWideScreen = screenWidth > 1024;
    final isTablet = screenWidth > 700 && screenWidth <= 1024;

    final heroHeight = isWideScreen ? 450.0 : (isTablet ? 400.0 : 350.0);

    double headlineSize;
    double bannerTextSize;
    double bannerPointSize;

    if (isWideScreen) {
      headlineSize = 45;
      bannerTextSize = 20;
      bannerPointSize = 16;
    } else if (isTablet) {
      headlineSize = 35;
      bannerTextSize = 18;
      bannerPointSize = 16;
    } else {
      headlineSize = 28;
      bannerTextSize = 14;
      bannerPointSize = 13;
    }

    return Scaffold(
      appBar: AppBar(
        backgroundColor: isDarkMode
            ? const Color(0xFF1C3B4B)
            : const Color(0xFF4E7F85),
        elevation: 0,
        leading: Builder(
          builder: (context) {
            final screenWidth = MediaQuery.of(context).size.width;
            double iconSize;

            if (screenWidth > 1024) {
              iconSize = 20;
            } else if (screenWidth > 700) {
              iconSize = 18;
            } else {
              iconSize = 14;
            }

            return IconButton(
              icon: Icon(Icons.arrow_back, color: Colors.white, size: iconSize),
              onPressed: () => Navigator.of(context).pop(),
            );
          },
        ),
      ),
      extendBodyBehindAppBar: false,
      body: SafeArea(
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: isDarkMode
                  ? [const Color(0xFF393939), const Color(0xFF02364C)]
                  : [const Color(0xFFBFF2ED), const Color(0xFF4F6A70)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: SingleChildScrollView(
            child: Column(
              children: [
                if (isWideScreen)
                  _buildHeroDesktop(
                        heroHeight,
                        headlineSize,
                        bannerTextSize,
                        bannerPointSize,
                        context,
                        isDarkMode,
                        sensor,
                      )
                      .animate()
                      .slideX(begin: -0.2, duration: 1600.ms)
                      .fadeIn(duration: 1600.ms)
                else if (isTablet)
                  _buildHeroTablet(
                        heroHeight,
                        headlineSize,
                        bannerTextSize,
                        bannerPointSize,
                        context,
                        isDarkMode,
                        sensor,
                      )
                      .animate()
                      .slideY(begin: -0.2, duration: 1600.ms)
                      .fadeIn(duration: 1600.ms)
                else
                  _buildHeroMobile(
                        heroHeight,
                        headlineSize,
                        bannerTextSize,
                        bannerPointSize,
                        context,
                        isDarkMode,
                        sensor,
                      )
                      .animate()
                      .slideY(begin: -0.2, duration: 1600.ms)
                      .fadeIn(duration: 1600.ms),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: (isWideScreen || isTablet)
                      ? _buildIpadLayout(isDarkMode, sensor)
                            .animate()
                            .fadeIn(duration: 1600.ms)
                            .slideY(begin: 0.2, duration: 1600.ms)
                      : Column(
                          children: [
                            _buildFeaturesCard(isDarkMode, sensor)
                                .animate()
                                .fadeIn(duration: 1500.ms)
                                .slideX(begin: -0.2, duration: 1500.ms),
                            const SizedBox(height: 16),
                            _buildApplicationsCard(isDarkMode, sensor)
                                .animate()
                                .fadeIn(duration: 1600.ms)
                                .slideX(begin: 0.2, duration: 1600.ms),
                          ],
                        ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16.0,
                    vertical: 8.0,
                  ),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        maxWidth: isWideScreen ? 1000 : double.infinity,
                      ),
                      child:
                          _buildSpecificationsCard(context, isDarkMode, sensor)
                              .animate()
                              .fadeIn(duration: 1700.ms)
                              .slideY(begin: 0.3, duration: 1700.ms),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeroDesktop(
    double heroHeight,
    double headlineSize,
    double bannerTextSize,
    double bannerPointSize,
    BuildContext context,
    bool isDarkMode,
    Map sensor,
  ) {
    return Container(
      color: isDarkMode ? const Color(0xFF1C3B4B) : const Color(0xFF4E7F85),
      padding: const EdgeInsets.symmetric(horizontal: 92, vertical: 4),
      child: Row(
        children: [
          Expanded(
            flex: 1,

            child:
                _buildHeroText(
                      headlineSize,
                      bannerTextSize,
                      bannerPointSize,
                      context,
                      isDarkMode,
                      sensor,
                    )
                    .animate()
                    .fadeIn(duration: 1500.ms)
                    .slideX(begin: -0.2, duration: 1600.ms),
          ),
          const SizedBox(width: 20),
          Expanded(
            flex: 1,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 450),
              child: Image.asset(sensor["imagePath"], fit: BoxFit.contain)
                  .animate()
                  .fadeIn(duration: 1600.ms)
                  .scale(duration: 1800.ms, curve: Curves.easeOutBack),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroTablet(
    double heroHeight,
    double headlineSize,
    double bannerTextSize,
    double bannerPointSize,
    BuildContext context,
    bool isDarkMode,
    Map sensor,
  ) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          color: isDarkMode ? const Color(0xFF1C3B4B) : const Color(0xFF4E7F85),
          padding: const EdgeInsets.all(16),
          child:
              _buildHeroText(
                    headlineSize,
                    bannerTextSize,
                    bannerPointSize,
                    context,
                    isDarkMode,
                    sensor,
                  )
                  .animate()
                  .fadeIn(duration: 1400.ms)
                  .slideX(begin: -0.2, duration: 1400.ms),
        ),
        SizedBox(
          height: heroHeight * 0.6,
          child: Image.asset(sensor["imagePath"], fit: BoxFit.contain)
              .animate()
              .fadeIn(duration: 1600.ms)
              .scale(duration: 1800.ms, curve: Curves.easeOutBack),
        ),
      ],
    );
  }

  Widget _buildHeroMobile(
    double heroHeight,
    double headlineSize,
    double bannerTextSize,
    double bannerPointSize,
    BuildContext context,
    bool isDarkMode,
    Map sensor,
  ) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          color: isDarkMode ? const Color(0xFF1C3B4B) : const Color(0xFF4E7F85),
          padding: const EdgeInsets.all(16),
          child:
              _buildHeroText(
                    headlineSize,
                    bannerTextSize,
                    bannerPointSize,
                    context,
                    isDarkMode,
                    sensor,
                  )
                  .animate()
                  .fadeIn(duration: 1400.ms)
                  .slideX(begin: -0.2, duration: 1400.ms),
        ),
        SizedBox(
          height: heroHeight * 0.6,
          child: Image.asset(sensor["imagePath"], fit: BoxFit.contain)
              .animate()
              .fadeIn(duration: 1600.ms)
              .scale(duration: 1800.ms, curve: Curves.easeOutBack),
        ),
      ],
    );
  }

Widget _buildHeroText(
  double headlineSize,
  double bannerTextSize,
  double bannerPointSize,
  BuildContext context,
  bool isDarkMode,
  Map sensor,
) {
  debugPrint(
      "buildHeroText called with email: $userEmail, imagePath: ${sensor["imagePath"]}");

  // Check if user has access to code links for this sensor
  final email = userEmail?.toLowerCase() ?? "";
  bool hasCodeAccess = false;
  if (email == "guest" || email.isEmpty) {
    hasCodeAccess = false;
    debugPrint("No access: Email is 'guest' or empty");
  } else {
    final imageFileName = sensor["imagePath"].split('/').last;

    final matchingUser = userAccess.keys.firstWhere(
      (key) => email.contains(key),
      orElse: () => "",
    );
    if (matchingUser.isNotEmpty) {
      hasCodeAccess = userAccess[matchingUser]!.contains(imageFileName);
      debugPrint(
        "User: $matchingUser, ImagePath: $imageFileName, "
        "AllowedPaths: ${userAccess[matchingUser]}, Access: $hasCodeAccess",
      );
    } else {
      debugPrint("No matching user found for email: $email");
    }
  }

  return Stack(
    children: [
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: "${sensor["title"]} ",
                  style: TextStyle(
                    fontSize: headlineSize,
                    fontWeight: FontWeight.bold,
                    color: const Color.fromARGB(255, 174, 130, 250),
                  ),
                ),
                TextSpan(
                  text: sensor["highlightText"],
                  style: TextStyle(
                    fontSize: headlineSize,
                    fontWeight: FontWeight.bold,
                    color: Colors.yellow.shade200,
                  ),
                ),
              ],
            ),
          ),
          Container(
            margin: const EdgeInsets.only(top: 6, bottom: 16),
            height: 3,
            width: headlineSize * 5,
            color: Colors.lightBlueAccent,
          ),
          Text(
            sensor["subtitle"],
            style: TextStyle(
              fontSize: bannerTextSize,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          )
              .animate()
              .fadeIn(duration: 1400.ms)
              .slideY(begin: 0.2, duration: 1400.ms),

          const SizedBox(height: 16),

          // ---- Banner Points ----
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: (sensor["bannerPoints"] as List<dynamic>)
                .map(
                  (point) => BannerPoint(point, fontSize: bannerPointSize)
                      .animate()
                      .fadeIn(duration: 1300.ms)
                      .slideX(begin: -0.1, duration: 1300.ms),
                )
                .toList(),
          ),

          const SizedBox(height: 20),

          // ---- Buttons Row ----
          Row(
            children: [
              _buildBannerButton(
                "Enquire",
                Colors.deepPurple,
                () => _sendEmail(context, sensor["email"]),
              ).animate().scale(duration: 1400.ms, curve: Curves.easeOutBack),

              const SizedBox(width: 16),

              // ---- nRF Folder Download Button ----
              if (sensor.containsKey("nreCodeLink") &&
                  sensor["nreCodeLink"] != null)
                Tooltip(
                  message: "Download nRF Folder (ZIP)",
                  waitDuration: const Duration(milliseconds: 400),
                  child: IconButton(
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.amber.shade700,
                      padding: const EdgeInsets.all(10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    icon: const Icon(Icons.folder_zip, color: Colors.white),
                    onPressed: () => downloadFolder(context,sensor["nreCodeLink"],sensor["title"]),
                  ),
                )
              else
                Tooltip(
                  message: "nRF Folder not available",
                  waitDuration: const Duration(milliseconds: 400),
                  child: IconButton(
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.grey.shade600,
                      padding: const EdgeInsets.all(10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    icon: const Icon(Icons.folder_off, color: Colors.white),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content:
                              Text("Updating folder soon, not available now"),
                        ),
                      );
                    },
                  ),
                ),
                     const SizedBox(width: 12),

              // QuecPython Code button (raw/download link)
              if (sensor.containsKey("quecCodeLink") &&
                  sensor["quecCodeLink"] != null)
                Tooltip(
                  message: "Download QuecPython Codes",
                  waitDuration: const Duration(milliseconds: 400),
                  child: IconButton(
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.blueAccent,
                      padding: const EdgeInsets.all(10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    icon: const Icon(
                      Icons.developer_mode,
                      color: Colors.white,
                    ),
                      onPressed: () => downloadFolder(context,sensor["quecCodeLink"],sensor["title"]),
                  ),
                )
              else
                Tooltip(
                  message: "QuecPython folder not available",
                  waitDuration: const Duration(milliseconds: 400),
                  child: IconButton(
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.grey.shade600,
                      padding: const EdgeInsets.all(10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    icon: const Icon(
                      Icons.developer_mode,
                      color: Colors.white,
                    ),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content:
                              Text("Updating folder soon, not available now"),
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
                   
        ],
      ),
    ],
  );
}

Future<void> downloadFolder(BuildContext context, String folderUrl, String zipFileName) async {
  final archive = Archive();

  // Show downloading snackbar
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text("Downloading $zipFileName..."),
      duration: const Duration(seconds: 2),
    ),
  );

  try {
    // Recursive function to fetch files and add to archive
    Future<void> fetchFiles(String apiUrl, String pathInZip) async {
      final response = await http.get(Uri.parse(apiUrl));
      if (response.statusCode != 200) {
        throw Exception("GitHub API error: ${response.statusCode}");
      }

      final List<dynamic> contents = jsonDecode(response.body);

      for (var item in contents) {
        final type = item['type'];
        final name = item['name'];

        if (type == 'file') {
          final downloadUrl = item['download_url'];
          if (downloadUrl != null) {
            final fileResponse = await http.get(Uri.parse(downloadUrl));
            final filePath = pathInZip.isEmpty ? name : '$pathInZip/$name';
            archive.addFile(
              ArchiveFile(filePath, fileResponse.bodyBytes.length, fileResponse.bodyBytes),
            );
          }
        } else if (type == 'dir') {
          final dirApiUrl = item['url']; // API URL for subdirectory
          final subPathInZip = pathInZip.isEmpty ? name : '$pathInZip/$name';
          await fetchFiles(dirApiUrl, subPathInZip);
        }
      }
    }

    // Convert GitHub folder URL to API URL
    final uriParts = folderUrl.split('/');
    if (uriParts.length < 7) throw Exception("Invalid GitHub folder URL");

    final username = uriParts[3];
    final repo = uriParts[4];
    final branch = uriParts[6];
    final path = uriParts.sublist(7).join('/');
    final apiUrl =
        "https://api.github.com/repos/$username/$repo/contents/$path?ref=$branch";

    await fetchFiles(apiUrl, '');

    final zipData = ZipEncoder().encode(archive);
    final blob = html.Blob([zipData]);
    final url = html.Url.createObjectUrlFromBlob(blob);
    final anchor = html.AnchorElement(href: url)
      ..setAttribute("download", "$zipFileName.zip")
      ..click();
    html.Url.revokeObjectUrl(url);

    // Success snackbar
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("$zipFileName downloaded successfully!")),
    );

  } catch (e) {
    debugPrint("Error downloading folder: $e");
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Error downloading folder: $e")),
    );
  }
}

  Future<void> _sendEmail(BuildContext context, String email) async {
    final subject = Uri.encodeComponent("Product Enquiry");
    final body = Uri.encodeComponent("Hello, I am interested in your product.");

    final Uri mailtoUri = Uri(
      scheme: 'mailto',
      path: email,
      query: "subject=$subject&body=$body",
    );

    try {
      bool launched = false;

      // Case 1: Web but running on mobile browser → use mailto
      if (kIsWeb &&
          (defaultTargetPlatform == TargetPlatform.iOS ||
              defaultTargetPlatform == TargetPlatform.android)) {
        launched = await launchUrl(mailtoUri);
      }
      // Case 2: Native mobile app
      else if (!kIsWeb && (Platform.isAndroid || Platform.isIOS)) {
        launched = await launchUrl(
          mailtoUri,
          mode: LaunchMode.externalApplication,
        );
      }
      // Case 3: Desktop (Windows/Mac/Linux) → Gmail fallback
      else {
        final gmailUrl = Uri.parse(
          "https://mail.google.com/mail/?view=cm&fs=1&to=${Uri.encodeComponent(email)}"
          "&su=$subject&body=$body",
        );
        launched = await launchUrl(
          gmailUrl,
          mode: LaunchMode.externalApplication,
        );
      }

      if (!launched) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Could not open email client.")),
        );
      }
    } catch (e) {
      debugPrint("Email error: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Unable to open email client.")),
      );
    }
  }

  // ---------------- FEATURES & APPLICATIONS ----------------
  Widget _buildIpadLayout(bool isDarkMode, Map sensor) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: _buildFeaturesCard(isDarkMode, sensor)
              .animate()
              .fadeIn(duration: 1400.ms)
              .slideX(begin: -0.2, duration: 1400.ms),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildApplicationsCard(isDarkMode, sensor)
              .animate()
              .fadeIn(duration: 1400.ms)
              .slideX(begin: 0.2, duration: 1400.ms),
        ),
      ],
    );
  }

  Widget _buildFeaturesCard(bool isDarkMode, Map sensor) {
    // The original Card widget and its content
    final cardContent = Card(
      elevation: 4,
      color: isDarkMode ? Colors.grey.shade900 : Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Key Features",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: isDarkMode ? Colors.yellow.shade200 : Colors.deepPurple,
              ),
            ),
            const SizedBox(height: 10),
            // Use the new SimpleListItem instead of HoverListItem
            ...(sensor["features"] as List<dynamic>)
                .map(
                  (f) => SimpleListItem(text: f, isDarkMode: isDarkMode)
                      .animate()
                      .fadeIn(duration: 1300.ms)
                      .slideY(begin: 0.1, duration: 1300.ms),
                )
                .toList(),
          ],
        ),
      ),
    );

    // Wrap the entire card content in our new HoverableCard widget
    return HoverableCard(child: cardContent);
  }

  Widget _buildApplicationsCard(bool isDarkMode, Map sensor) {
    final cardContent = Card(
      elevation: 4,
      color: isDarkMode ? Colors.grey.shade900 : Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Applications",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: isDarkMode ? Colors.yellow.shade200 : Colors.deepPurple,
              ),
            ),
            const SizedBox(height: 10),
            // Use the new SimpleListItem
            ...(sensor["applications"] as List<dynamic>)
                .map(
                  (a) => SimpleListItem(text: a, isDarkMode: isDarkMode)
                      .animate()
                      .fadeIn(duration: 1300.ms)
                      .slideY(begin: 0.1, duration: 1300.ms),
                )
                .toList(),
          ],
        ),
      ),
    );

    // 👉 Wrap the card content in HoverableCard
    return HoverableCard(child: cardContent);
  }

  Widget _buildSpecificationsCard(
    BuildContext context,
    bool isDarkMode,
    Map sensor,
  ) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isWideScreen = screenWidth > 800;
    final specs = sensor["specifications"] as List<dynamic>;

    final cardContent = Card(
      elevation: 4,
      color: isDarkMode ? Colors.grey.shade900 : Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Specifications",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: isDarkMode ? Colors.yellow.shade200 : Colors.deepPurple,
              ),
            ),
            const SizedBox(height: 20),
            if (isWideScreen)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: specs
                          .sublist(0, (specs.length / 2).ceil())
                          .map(
                            (s) =>
                                SimpleListItem(text: s, isDarkMode: isDarkMode),
                          )
                          .toList(),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: specs
                          .sublist((specs.length / 2).ceil())
                          .map(
                            (s) =>
                                SimpleListItem(text: s, isDarkMode: isDarkMode),
                          )
                          .toList(),
                    ),
                  ),
                ],
              )
            else
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: specs
                    .map((s) => SimpleListItem(text: s, isDarkMode: isDarkMode))
                    .toList(),
              ),
            const SizedBox(height: 40),
            Center(
              child: _buildBannerButton(
                "Download Datasheet",
                Colors.deepPurple,
                () {
                  DownloadManager.downloadFile(
                    context: context,
                    sensorKey: sensor["datasheetKey"],
                    fileType: "datasheet",
                  );
                },
              ).animate().scale(duration: 1400.ms, curve: Curves.easeOutBack),
            ),
          ],
        ),
      ),
    );

    return HoverableCard(child: cardContent);
  }

  // ---------------- HELPERS ----------------

  static Widget _buildBannerButton(
    String label,
    Color color,
    VoidCallback onPressed,
  ) {
    return ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: color,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(6),
            ),
            elevation: 8,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          ),
          onPressed: onPressed,
          icon: const Icon(Icons.arrow_forward, color: Colors.white),
          label: Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
        )
        .animate(onPlay: (controller) => controller.repeat(reverse: true))
        .scale(
          duration: 1200.ms,
          begin: const Offset(1, 1),
          end: const Offset(1.08, 1.08),
          curve: Curves.easeInOut,
        )
        .then()
        .shimmer(duration: 1500.ms, color: Colors.white.withOpacity(0.2));
  }
}

// ------------------- NEW HOVERABLE LIST ITEM -------------------
class HoverListItem extends StatefulWidget {
  final String text;
  final bool isDarkMode;

  const HoverListItem({
    super.key,
    required this.text,
    required this.isDarkMode,
  });

  @override
  State<HoverListItem> createState() => _HoverListItemState();
}

class _HoverListItemState extends State<HoverListItem> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        transform: Matrix4.identity()..scale(_isHovering ? 1.03 : 1.0),
        margin: const EdgeInsets.symmetric(vertical: 4),
        child: Card(
          elevation: _isHovering ? 6 : 2,
          color: _isHovering
              ? (widget.isDarkMode ? Colors.teal.shade800 : Colors.teal.shade50)
              : (widget.isDarkMode
                    ? const Color.fromARGB(255, 44, 44, 44)
                    : const Color.fromARGB(255, 243, 243, 243)),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
            child: Row(
              children: [
                Icon(
                  Icons.check_circle,
                  color: widget.isDarkMode ? Colors.tealAccent : Colors.teal,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.text,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: widget.isDarkMode ? Colors.white : Colors.black87,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ------------------- REUSABLE SUPPORT -------------------

class BannerPoint extends StatelessWidget {
  final String text;
  final double? fontSize;
  const BannerPoint(this.text, {super.key, this.fontSize});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          const Icon(Icons.circle, size: 8, color: Colors.white),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              text,
              style: TextStyle(
                color: Colors.white,
                fontSize: fontSize ?? 14,
                fontWeight: FontWeight.w500,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
