import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css'; // Import our custom CSS
import L from 'leaflet';
import { useWeatherStore } from '../store/weatherStore';

// Fix for default marker icons in Leaflet with Vite
// This is needed because Leaflet's default marker icons don't work properly with Vite's asset handling
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map center updates when selectedLocation changes
function MapCenterUpdater({ selectedLocation }: { selectedLocation: { lat: number, lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedLocation) {
      map.setView([selectedLocation.lat, selectedLocation.lng], 12);
    }
  }, [selectedLocation, map]);
  
  return null;
}

// Component to handle map click events
function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const { selectedLocation } = useWeatherStore();
  const [position, setPosition] = useState<L.LatLng | null>(null);
  
  // Update position when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      setPosition(L.latLng(selectedLocation.lat, selectedLocation.lng));
    }
  }, [selectedLocation]);
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
}

interface MapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: [number, number];
  initialZoom?: number;
}

export const Map: React.FC<MapProps> = ({ 
  onLocationSelect, 
  initialPosition = [37.9838, 23.7275], // Default to Athens, Greece
  initialZoom = 10 
}) => {
  const { selectedLocation } = useWeatherStore();
  
  return (
    <div className="map-container">
      <MapContainer 
        center={initialPosition} 
        zoom={initialZoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} />
        <MapCenterUpdater selectedLocation={selectedLocation} />
      </MapContainer>
    </div>
  );
}; 