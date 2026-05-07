import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth, getFirebaseToken } from '../firebase';
import MapPicker from './MapPicker';
import DestinationMapPicker from './DestinationMapPicker';

const API_BASE = 'http://localhost:8000';

export default function FarmerDashboard({ onBack }) {
  const [cropName, setCropName] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [destinationText, setDestinationText] = useState(''); // optional human-readable
  const [harvestDate, setHarvestDate] = useState('');
  const [pickupLat, setPickupLat] = useState(null);
  const [pickupLng, setPickupLng] = useState(null);
  const [destLat, setDestLat] = useState(null);
  const [destLng, setDestLng] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [bidsForListing, setBidsForListing] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const currentUser = auth.currentUser;
  const farmerId = currentUser?.uid;
  const userName = currentUser?.displayName || currentUser?.email || 'Farmer';

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    if (!farmerId) return;
    try {
      const q = query(collection(db, 'listings'), where('farmer_id', '==', farmerId));
      const snapshot = await getDocs(q);
      const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyListings(listings);
      for (const listing of listings) {
        await fetchBidsForListing(listing.id);
      }
    } catch (error) { console.error(error); }
  };

  const fetchBidsForListing = async (listingId) => {
    try {
      const response = await fetch(`${API_BASE}/bids/listing/${listingId}`);
      if (response.ok) {
        const bids = await response.json();
        setBidsForListing(prev => ({ ...prev, [listingId]: bids }));
      }
    } catch (error) { console.error(error); }
  };

  const handleAcceptBid = async (bidId, listingId) => {
    setActionLoading(prev => ({ ...prev, [bidId]: true }));
    const token = await getFirebaseToken();
    try {
      const response = await fetch(`${API_BASE}/bids/${bidId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Bid accepted!');
        fetchMyListings();
      } else {
        const err = await response.json();
        alert('Error: ' + (err.detail || 'Unknown'));
      }
    } catch (error) { alert('Network error'); }
    setActionLoading(prev => ({ ...prev, [bidId]: false }));
  };

  const handleRejectBid = async (bidId, listingId) => {
    setActionLoading(prev => ({ ...prev, [bidId]: true }));
    const token = await getFirebaseToken();
    try {
      const response = await fetch(`${API_BASE}/bids/${bidId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Bid rejected');
        fetchMyListings();
      } else {
        const err = await response.json();
        alert('Error: ' + (err.detail || 'Unknown'));
      }
    } catch (error) { alert('Network error'); }
    setActionLoading(prev => ({ ...prev, [bidId]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickupLat || !pickupLng) {
      alert('Please select a pickup location on the map');
      return;
    }
    if (!destLat || !destLng) {
      alert('Please select a destination location on the map');
      return;
    }
    setLoading(true);

    const listingData = {
      farmer_id: farmerId,
      crop_name: cropName,
      quantity_kg: parseFloat(quantityKg),
      price_per_kg: parseFloat(pricePerKg),
      location: `Pickup: ${pickupLat.toFixed(4)},${pickupLng.toFixed(4)}`,
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      destination: destinationText || `Destination: ${destLat.toFixed(4)},${destLng.toFixed(4)}`,
      dest_lat: destLat,
      dest_lng: destLng,
      harvest_date: harvestDate
    };

    const token = await getFirebaseToken();
    if (!token) {
      alert('Not logged in');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/listings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(listingData)
      });
      if (response.ok) {
        alert('Listing created!');
        setCropName(''); setQuantityKg(''); setPricePerKg(''); setDestinationText('');
        setHarvestDate(''); setPickupLat(null); setPickupLng(null); setDestLat(null); setDestLng(null);
        fetchMyListings();
      } else {
        alert('Error creating listing');
      }
    } catch (error) { alert('Network error'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-2xl font-bold text-green-800">Farmer Dashboard</h1><p className="text-gray-600">Welcome, {userName}!</p></div>
          <button onClick={onBack} className="text-gray-600">Sign Out</button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Post New Harvest</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Crop Name" value={cropName} onChange={e => setCropName(e.target.value)} required className="w-full border rounded p-2" />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Quantity (kg)" value={quantityKg} onChange={e => setQuantityKg(e.target.value)} required className="border rounded p-2" />
              <input type="number" placeholder="Price per kg (USD)" value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} required className="border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location (click on map)</label>
              <MapPicker onLocationSelect={(coords) => { setPickupLat(coords.lat); setPickupLng(coords.lng); }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination (Drop‑off) – click map, search, or use current location</label>
              <DestinationMapPicker onLocationSelect={(coords) => { setDestLat(coords.lat); setDestLng(coords.lng); }} />
            </div>
            <input type="text" placeholder="Destination address (optional, human‑readable)" value={destinationText} onChange={e => setDestinationText(e.target.value)} className="w-full border rounded p-2" />
            <input type="date" value={harvestDate} onChange={e => setHarvestDate(e.target.value)} required className="w-full border rounded p-2" />
            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded">{loading ? 'Posting...' : 'Post Listing'}</button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">My Listings & Bids</h2>
          {myListings.length === 0 ? <p>No listings yet.</p> : myListings.map(listing => (
            <div key={listing.id} className="border rounded-lg p-4 mb-4">
              <p className="font-semibold">{listing.crop_name} - {listing.quantity_kg}kg @ ${listing.price_per_kg}/kg</p>
              <p className="text-sm">Pickup: {listing.location || `${listing.pickup_lat},${listing.pickup_lng}`}</p>
              <p className="text-sm">Destination: {listing.destination || `${listing.dest_lat},${listing.dest_lng}`}</p>
              <p className="text-sm">Status: <span className={`font-bold ${listing.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>{listing.status}</span></p>
              <div className="mt-2">
                <h3 className="font-medium">Bids:</h3>
                {bidsForListing[listing.id]?.length ? bidsForListing[listing.id].map(bid => (
                  <div key={bid.id} className="ml-4 p-2 border-t text-sm">
                    <p>Driver: {bid.driver_id} | Bid: ${bid.bid_price} | Status: {bid.status}</p>
                    {listing.status === 'active' && bid.status === 'pending' && (
                      <div className="mt-1 space-x-2">
                        <button onClick={() => handleAcceptBid(bid.id, listing.id)} disabled={actionLoading[bid.id]} className="bg-green-500 text-white px-3 py-1 rounded text-xs">Accept</button>
                        <button onClick={() => handleRejectBid(bid.id, listing.id)} disabled={actionLoading[bid.id]} className="bg-red-500 text-white px-3 py-1 rounded text-xs">Reject</button>
                      </div>
                    )}
                  </div>
                )) : <p className="text-gray-500 text-sm ml-4">No bids yet.</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}