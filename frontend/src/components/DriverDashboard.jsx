import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const API_BASE = 'http://localhost:8000';

export default function DriverDashboard({ onBack }) {
  const [listings, setListings] = useState([]);
  const [bidPrice, setBidPrice] = useState({});
  const driverId = 'driver456';

  useEffect(() => {
    fetchActiveListings();
  }, []);

  const fetchActiveListings = async () => {
    try {
      const q = query(collection(db, 'listings'), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const activeListings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(activeListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const placeBid = async (listingId) => {
    const price = bidPrice[listingId];
    if (!price) {
      alert('Enter a bid amount');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/bids/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          driver_id: driverId,
          bid_price: parseFloat(price),
          vehicle_type: 'truck',
          estimated_arrival_hours: 4
        })
      });
      if (response.ok) {
        alert('Bid placed!');
        setBidPrice(prev => ({ ...prev, [listingId]: '' }));
      } else {
        alert('Error placing bid');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Driver Dashboard</h1>
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">← Change Role</button>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Available Loads</h2>
          {listings.length === 0 ? (
            <p className="text-gray-500">No active listings at the moment.</p>
          ) : (
            <div className="space-y-4">
              {listings.map(listing => (
                <div key={listing.id} className="border rounded-lg p-4">
                  <p className="font-semibold">{listing.crop_name}</p>
                  <p className="text-sm text-gray-600">{listing.quantity_kg} kg at ${listing.price_per_kg}/kg from {listing.location}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Transport bid ($)"
                      value={bidPrice[listing.id] || ''}
                      onChange={(e) => setBidPrice(prev => ({ ...prev, [listing.id]: e.target.value }))}
                      className="border rounded-md p-1 w-32 text-sm"
                    />
                    <button onClick={() => placeBid(listing.id)} className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm">Place Bid</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}