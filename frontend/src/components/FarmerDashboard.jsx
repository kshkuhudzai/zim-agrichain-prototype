import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const API_BASE = 'http://localhost:8000';

export default function FarmerDashboard({ onBack }) {
  const [cropName, setCropName] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [location, setLocation] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const farmerId = 'farmer123'; // In real app, get from auth

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const q = query(collection(db, 'listings'), where('farmer_id', '==', farmerId));
      const snapshot = await getDocs(q);
      const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyListings(listings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/listings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: farmerId,
          crop_name: cropName,
          quantity_kg: parseFloat(quantityKg),
          price_per_kg: parseFloat(pricePerKg),
          location: location,
          harvest_date: harvestDate
        })
      });
      if (response.ok) {
        alert('Listing created successfully!');
        setCropName('');
        setQuantityKg('');
        setPricePerKg('');
        setLocation('');
        setHarvestDate('');
        fetchMyListings();
      } else {
        alert('Error creating listing');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">Farmer Dashboard</h1>
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">← Change Role</button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Post New Harvest</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Crop Name</label>
              <input type="text" value={cropName} onChange={e => setCropName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity (kg)</label>
                <input type="number" step="0.1" value={quantityKg} onChange={e => setQuantityKg(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price per kg (USD)</label>
                <input type="number" step="0.01" value={pricePerKg} onChange={e => setPricePerKg(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Harvest Date</label>
              <input type="date" value={harvestDate} onChange={e => setHarvestDate(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition">
              {loading ? 'Posting...' : 'Post Listing'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">My Listings</h2>
          {myListings.length === 0 ? (
            <p className="text-gray-500">No listings yet.</p>
          ) : (
            <div className="space-y-4">
              {myListings.map(listing => (
                <div key={listing.id} className="border rounded-lg p-4">
                  <p className="font-semibold">{listing.crop_name}</p>
                  <p className="text-sm text-gray-600">{listing.quantity_kg} kg at ${listing.price_per_kg}/kg</p>
                  <p className="text-sm text-gray-600">Location: {listing.location}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {listing.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}