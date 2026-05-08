import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth, getFirebaseToken } from '../firebase';
import DriverMap from './DriverMap';
import OrderHistory from './OrderHistory';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function DriverDashboard({ onBack }) {
  const [allActiveListings, setAllActiveListings] = useState([]);
  const [availableListings, setAvailableListings] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const currentUser = auth.currentUser;
  const driverId = currentUser?.uid;
  const userName = currentUser?.displayName || currentUser?.email || 'Driver';

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setDriverLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (allActiveListings.length > 0 && myBids.length > 0) {
      const bidListingIds = myBids.map(bid => bid.listing_id);
      const filtered = allActiveListings.filter(listing => !bidListingIds.includes(listing.id));
      setAvailableListings(filtered);
    } else {
      setAvailableListings(allActiveListings);
    }
  }, [allActiveListings, myBids]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchActiveListings(), fetchMyBids()]);
    setLoading(false);
  };

  const fetchActiveListings = async () => {
    try {
      const q = query(collection(db, 'listings'), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllActiveListings(listings);
    } catch (error) { console.error(error); }
  };

  const fetchMyBids = async () => {
    if (!driverId) return;
    try {
      const token = await getFirebaseToken();
      const res = await fetch(`${API_BASE}/bids/my-bids`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyBids(data);
      } else {
        // fallback to direct Firestore query
        const q = query(collection(db, 'bids'), where('driver_id', '==', driverId));
        const snapshot = await getDocs(q);
        const bids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyBids(bids);
      }
    } catch (error) { console.error(error); }
  };

  const placeBid = async (listingId, bidAmount) => {
    if (!bidAmount) return;
    const token = await getFirebaseToken();
    if (!token) { alert('Not logged in'); return; }
    try {
      const response = await fetch(`${API_BASE}/bids/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          listing_id: listingId,
          driver_id: driverId,
          bid_price: parseFloat(bidAmount),
          vehicle_type: 'truck',
          estimated_arrival_hours: 4
        })
      });
      if (response.ok) {
        alert('Bid placed!');
        await fetchAllData();
      } else {
        const err = await response.json();
        alert('Error: ' + (err.detail || 'Unknown'));
      }
    } catch (error) { alert('Network error'); }
  };

  const handlePlaceBidFromMap = (listingId) => {
    const price = prompt('Enter your transport bid amount ($)');
    if (price) placeBid(listingId, price);
  };

  useEffect(() => {
    const acceptedBid = myBids.find(bid => bid.status === 'accepted');
    if (!acceptedBid) return;
    const interval = setInterval(async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          const token = await getFirebaseToken();
          await fetch(`${API_BASE}/drivers/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ lat: latitude, lng: longitude })
          });
        }, (err) => console.error(err), { enableHighAccuracy: true });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [myBids]);

  if (showHistory) {
    return <OrderHistory onBack={() => setShowHistory(false)} />;
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading available loads...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-800">Driver Dashboard</h1>
            <p className="text-gray-600">Welcome, {userName}!</p>
          </div>
          <div className="space-x-2">
            <button onClick={() => setShowHistory(true)} className="text-blue-600 hover:text-blue-800">Order History</button>
            <button onClick={onBack} className="text-gray-600 hover:text-gray-800">Sign Out</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Nearby Loads (Map)</h2>
          <DriverMap listings={availableListings} onPlaceBid={handlePlaceBidFromMap} />
          {availableListings.length === 0 && <p className="text-gray-500 text-center mt-2">No new loads available. Check back later.</p>}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Loads (List)</h2>
          {availableListings.length === 0 ? (
            <p>No active listings you haven't bid on.</p>
          ) : (
            availableListings.map(listing => {
              const distance = driverLocation ?
                getDistance(driverLocation.lat, driverLocation.lng, listing.pickup_lat, listing.pickup_lng).toFixed(1) : null;
              return (
                <div key={listing.id} className="border rounded-lg p-4 mb-2">
                  <p className="font-semibold">{listing.crop_name} - {listing.quantity_kg}kg @ ${listing.price_per_kg}/kg</p>
                  <p className="text-sm">Pickup: {listing.location || `${listing.pickup_lat.toFixed(4)},${listing.pickup_lng.toFixed(4)}`}</p>
                  <p className="text-sm">Destination: {listing.destination || `${listing.dest_lat?.toFixed(4) || '?'},${listing.dest_lng?.toFixed(4) || '?'}`}</p>
                  {distance && <p className="text-xs text-gray-500">📏 Distance from you: {distance} km</p>}
                  <button onClick={() => { const price = prompt('Your bid ($)'); if (price) placeBid(listing.id, price); }} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm">Place Bid</button>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">My Bids</h2>
          {myBids.length === 0 ? (
            <p>No bids placed yet.</p>
          ) : (
            myBids.map(bid => (
              <div key={bid.id} className="border rounded-lg p-4 mb-2">
                <p className="font-medium">{bid.crop_name || 'Listing'}</p>
                <p>Your bid: ${bid.bid_price} | Status:
                  <span className={`font-bold ml-1 ${
                    bid.status === 'accepted' ? 'text-green-600' :
                    bid.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{bid.status}</span>
                </p>
                {bid.status === 'accepted' && (
                  <p className="text-sm text-green-700 mt-1">✓ Accepted! Coordinate with farmer.</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}