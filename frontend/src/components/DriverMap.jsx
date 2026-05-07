import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function DriverMap({ listings, onPlaceBid, center }) {
  const defaultCenter = center || [-17.8252, 31.0335];

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-300">
      <MapContainer center={defaultCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        {listings.map(listing => (
          <Marker key={listing.id} position={[listing.pickup_lat, listing.pickup_lng]}>
            <Popup>
              <div>
                <strong>{listing.crop_name}</strong><br />
                {listing.quantity_kg} kg @ ${listing.price_per_kg}/kg<br />
                <button
                  onClick={() => onPlaceBid(listing.id)}
                  className="mt-1 bg-blue-600 text-white px-2 py-1 rounded text-xs"
                >
                  Place Bid
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}