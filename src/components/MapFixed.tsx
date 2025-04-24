import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css'; // Import our custom CSS
import { useWeatherStore } from '../store/weatherStore';

// Fix for default marker icons in Leaflet with Vite
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapCenterUpdaterProps {
  center: [number, number];
}

const MapCenterUpdater: React.FC<MapCenterUpdaterProps> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  
  return null;
};

interface LocationMarkerProps {
  position: [number, number];
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position }) => {
  return <Marker position={position} icon={icon} />;
};

const MapClickHandler: React.FC = () => {
  const { setSelectedLocation } = useWeatherStore();
  
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setSelectedLocation({ lat, lng });
    },
  });
  
  return null;
};

export const Map: React.FC = () => {
  const { selectedLocation } = useWeatherStore();
  const mapRef = useRef<L.Map>(null);

  const center: [number, number] = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lng]
    : [37.9838, 23.7275]; // Default to Athens, Greece

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenterUpdater center={center} />
        <MapClickHandler />
        {selectedLocation && (
          <LocationMarker position={[selectedLocation.lat, selectedLocation.lng]} />
        )}
      </MapContainer>
    </div>
  );
}; 