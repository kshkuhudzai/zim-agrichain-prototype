import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth, getFirebaseToken } from '../firebase';

const API_BASE = 'http://localhost:8000';

export default function DriverDashboard({ onBack }) {
  const [activeListings, setActiveListings] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [bidPrice, setBidPrice] = useState({});
  const currentUser = auth.currentUser;
  const driverId = currentUser?.uid;
  const userName = currentUser?.displayName || currentUser?.email || 'Driver';

  useEffect(() => {
    fetchActiveListings();
    fetchMyBids();
  }, []);

  const fetchActiveListings = async () => {
    try {
      const q = query(collection(db, 'listings'), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      setActiveListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error(error); }
  };

  const fetchMyBids = async () => {
    try {
      // Since no endpoint to get bids by driver, query Firestore directly
      const q = query(collection(db, 'bids'), where('driver_id', '==', driverId));
      const snapshot = await getDocs(q);
      const bids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // enrich with listing details
      const enriched = [];
      for (const bid of bids) {
        const listingDoc = await getDocs(query(collection(db, 'listings'), where('id', '==', bid.listing_id)));
        if (!listingDoc.empty) {
          const listing = listingDoc.docs[0].data();
          enriched.push({ ...bid, crop_name: listing.crop_name, location: listing.location, destination: listing.destination });
        } else {
          enriched.push(bid);
        }
      }
      setMyBids(enriched);
    } catch (error) { console.error(error); }
  };

  const placeBid = async (listingId) => {
    const price = bidPrice[listingId];
    if (!price) { alert('Enter bid amount'); return; }
    const token = await getFirebaseToken();
    if (!token) { alert('Not logged in'); return; }
    try {
      const response = await fetch(`${API_BASE}/bids/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ listing_id: listingId, driver_id: driverId, bid_price: parseFloat(price), vehicle_type: 'truck', estimated_arrival_hours: 4 })
      });
      if (response.ok) {
        alert('Bid placed!');
        setBidPrice(prev => ({ ...prev, [listingId]: '' }));
        fetchMyBids();
      } else alert('Error placing bid');
    } catch (error) { alert('Network error'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-2xl font-bold text-blue-800">Driver Dashboard</h1><p className="text-gray-600">Welcome, {userName}!</p></div>
          <button onClick={onBack} className="text-gray-600">Sign Out</button>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Loads</h2>
          {activeListings.length === 0 ? <p>No active listings.</p> : activeListings.map(listing => (
            <div key={listing.id} className="border rounded-lg p-4 mb-2">
              <p className="font-semibold">{listing.crop_name} - {listing.quantity_kg}kg @ ${listing.price_per_kg}/kg</p>
              <p className="text-sm">Pickup: {listing.location} → Dropoff: {listing.destination}</p>
              <div className="mt-2 flex gap-2 items-center">
                <input type="number" placeholder="Your bid ($)" value={bidPrice[listing.id] || ''} onChange={e => setBidPrice(prev => ({...prev, [listing.id]: e.target.value}))} className="border rounded p-1 w-32" />
                <button onClick={() => placeBid(listing.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Place Bid</button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">My Bids</h2>
          {myBids.length === 0 ? <p>No bids placed yet.</p> : myBids.map(bid => (
            <div key={bid.id} className="border rounded-lg p-4 mb-2">
              <p className="font-medium">{bid.crop_name || 'Listing'}</p>
              <p className="text-sm">Your bid: ${bid.bid_price} | Status: <span className={`font-bold ${bid.status==='accepted'?'text-green-600':bid.status==='pending'?'text-yellow-600':'text-red-600'}`}>{bid.status}</span></p>
              {bid.status === 'accepted' && <p className="text-sm text-green-700">Accepted! Contact farmer at {bid.location}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}