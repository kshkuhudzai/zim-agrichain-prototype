import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function SearchControl({ setLocation }) {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latlng = L.latLng(parseFloat(lat), parseFloat(lon));
        map.flyTo(latlng, 14);
        setLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        alert('Destination not found');
      }
    } catch (err) {
      console.error(err);
      alert('Search failed');
    }
    setLoading(false);
  };

  return (
    <div className="absolute top-2 left-2 z-[1000] bg-white p-2 rounded shadow-md w-64">
      <form onSubmit={handleSearch} className="flex">
        <input
          type="text"
          placeholder="Search destination (market, buyer address...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded-l px-2 py-1 text-sm flex-grow"
        />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded-r text-sm">
          {loading ? '...' : 'Go'}
        </button>
      </form>
    </div>
  );
}

function DestinationMarker({ setLocation }) {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return position === null ? null : <Marker position={position} />;
}

function CurrentLocationButton({ setLocation }) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const latlng = L.latLng(latitude, longitude);
          map.flyTo(latlng, 14);
          setLocation({ lat: latitude, lng: longitude });
          setIsLocating(false);
        },
        (err) => {
          console.error(err);
          alert('Unable to get your location. Please check browser permissions.');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert('Geolocation not supported');
      setIsLocating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGetCurrentLocation}
      disabled={isLocating}
      className="absolute bottom-4 right-4 z-[1000] bg-white text-gray-800 px-3 py-2 rounded-md shadow-md text-sm font-medium border border-gray-300 hover:bg-gray-100"
    >
      {isLocating ? 'Locating...' : '📍 Use My Current Location as Destination'}
    </button>
  );
}

export default function DestinationMapPicker({ onLocationSelect, initialLocation }) {
  const [location, setLocation] = useState(initialLocation || { lat: -17.8252, lng: 31.0335 });

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    onLocationSelect(loc);
  };

  return (
    <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-300">
      <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <SearchControl setLocation={handleLocationSelect} />
        <DestinationMarker setLocation={handleLocationSelect} />
        <CurrentLocationButton setLocation={handleLocationSelect} />
      </MapContainer>
      <p className="text-xs text-gray-500 mt-1 text-center">Click map, search, or use current location for drop‑off point</p>
    </div>
  );
}