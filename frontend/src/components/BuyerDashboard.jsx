import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import OrderHistory from './OrderHistory';

export default function BuyerDashboard({ onBack }) {
  const [listings, setListings] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const currentUser = auth.currentUser;
  const userName = currentUser?.displayName || currentUser?.email || 'Buyer';

  useEffect(() => {
    fetchActiveListings();
  }, []);

  const fetchActiveListings = async () => {
    try {
      const q = query(collection(db, 'listings'), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const activeListings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(activeListings);
    } catch (error) { console.error(error); }
  };

  if (showHistory) {
    return <OrderHistory onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-purple-800">Buyer Dashboard</h1>
            <p className="text-gray-600">Welcome, {userName}!</p>
          </div>
          <div className="space-x-2">
            <button onClick={() => setShowHistory(true)} className="text-blue-600 hover:text-blue-800">Order History</button>
            <button onClick={onBack} className="text-gray-600 hover:text-gray-800">Sign Out</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Available Produce</h2>
          {listings.length === 0 ? (
            <p className="text-gray-500">No active listings.</p>
          ) : (
            <div className="space-y-4">
              {listings.map(listing => (
                <div key={listing.id} className="border rounded-lg p-4">
                  <p className="font-semibold">{listing.crop_name}</p>
                  <p className="text-sm text-gray-600">{listing.quantity_kg} kg at ${listing.price_per_kg}/kg</p>
                  <p className="text-sm text-gray-600">Pickup: {listing.location || `${listing.pickup_lat?.toFixed(4)},${listing.pickup_lng?.toFixed(4)}`}</p>
                  <p className="text-sm text-gray-600">Dropoff: {listing.destination || `${listing.dest_lat?.toFixed(4)},${listing.dest_lng?.toFixed(4)}`}</p>
                  <p className="text-sm text-gray-600">Harvest: {listing.harvest_date}</p>
                  <button className="mt-2 bg-purple-600 text-white px-3 py-1 rounded-md text-sm">Contact Farmer</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}