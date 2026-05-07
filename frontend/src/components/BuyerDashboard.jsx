import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export default function BuyerDashboard({ onBack }) {
  const [listings, setListings] = useState([]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-800">Buyer Dashboard</h1>
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">← Change Role</button>
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
                  <p className="text-sm text-gray-600">Location: {listing.location}</p>
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