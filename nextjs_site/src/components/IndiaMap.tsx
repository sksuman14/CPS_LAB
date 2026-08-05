'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';

// Leaflet requires defining custom marker icons manually in Next.js builds
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

const cpsLabs = [
  { name: "National Institute of Technology Delhi", lat: 28.7496, lng: 77.1166 },
  { name: "Dr. B.R. Ambedkar Institute, Jalandhar", lat: 31.3959, lng: 75.5352 },
  { name: "Tula's Institute, Dehradun", lat: 30.3165, lng: 78.0300 },
  { name: "Thapar Institute of Engineering and Technology, Patiala", lat: 30.3565, lng: 76.3647 },
  { name: "Chitkara University, Punjab", lat: 30.5170, lng: 76.6590 },
  { name: "Baba Farid College of Engineering & Technology, Bathinda", lat: 30.2110, lng: 74.9525 },
  { name: "University of Ladakh, Leh", lat: 34.1580, lng: 77.5830 },
  { name: "CCCT Chisopani, Sikkim", lat: 27.1669, lng: 88.4936 },
  { name: "Khalsa College of Engineering and Technology, Amritsar", lat: 31.6340, lng: 74.8723 },
  { name: "IIIT Una", lat: 31.4710, lng: 76.1716 },
  { name: "CICU Ludhiana", lat: 30.9000, lng: 75.8573 },
  { name: "IILM University, Greater Noida", lat: 28.4744, lng: 77.5030 },
  { name: "HRIT University, Ghaziabad", lat: 28.7814, lng: 77.5264 },
  { name: "SVPUAT Meerut", lat: 28.9845, lng: 77.7064 },
  { name: "Acropolis Institute of Technology and Research, Indore", lat: 22.7196, lng: 75.8577 },
  { name: "Hindustan Institute of Technology and Science, Chennai", lat: 12.8432, lng: 80.1546 },
  { name: "Model Institute of Engineering and Technology, Jammu", lat: 32.7266, lng: 74.8570 },
  { name: "Shoolini University, Solan", lat: 30.9084, lng: 77.0863 },
  { name: "Ambala College of Engineering & Applied Research", lat: 30.3782, lng: 76.7767 },
  { name: "Government Polytechnic College, Bhikhiwind", lat: 31.3303, lng: 74.7088 },
  { name: "SBAS Government Polytechnic College, Badbar (Barnala)", lat: 30.3800, lng: 75.5463 },
  { name: "MIT WPU, Pune", lat: 18.5286, lng: 73.8316 },
  { name: "Government Polytechnic College, Batala", lat: 31.8186, lng: 75.2029 },
  { name: "Government Polytechnic College, Amritsar", lat: 31.6488, lng: 74.8729 },
  { name: "NIT Sikkim", lat: 27.3064, lng: 88.3606 },
  { name: "Government Polytechnic College, Kotkapura", lat: 30.5819, lng: 74.8320 },
  { name: "Government ITI, Ropar", lat: 30.9680, lng: 76.5250 },
  { name: "Chandigarh University", lat: 30.7681, lng: 76.5754 },
  { name: "SRM Institute of Science and Technology, Chennai", lat: 12.8230, lng: 80.0444 },
  { name: "Government Polytechnic College, Mohali (Khunimajra)", lat: 30.7415, lng: 76.6890 },
  { name: "Dr. K.N. Modi University, Ghaziabad", lat: 28.6735, lng: 77.4540 },
];

export default function IndiaMap() {
  const [mapId, setMapId] = useState<string>('');

  useEffect(() => {
    // Generate a unique key on mount to force React to create a new DOM node
    // This circumvents the StrictMode/Fast Refresh "Map container is already initialized" error.
    setMapId(Date.now().toString());
  }, []);

  if (!mapId) return null;

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden z-10 border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      <MapContainer 
        key={mapId}
        center={[22.5937, 78.9629]} 
        zoom={4.3} 
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ zIndex: 1, backgroundColor: '#0A0E17' }} // Matches nextjs space
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {cpsLabs.map((lab, index) => (
          <Marker 
            key={index} 
            position={[lab.lat, lab.lng]} 
            icon={icon}
          >
            <Popup className="font-body">
              <div className="text-gray-900 font-bold mb-1">{lab.name}</div>
              <div className="text-gray-600 text-[10px] text-center border-t pt-1 mt-1 border-gray-200 uppercase tracking-widest">
                CPS Laboratory Network
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Heavy inner shadow to blend the cartographic map softly into the dark Next.js boundary */}
      <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_80px_rgba(17,24,39,1)]"></div>
    </div>
  );
}
