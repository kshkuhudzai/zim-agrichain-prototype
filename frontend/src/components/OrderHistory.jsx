import React, { useEffect, useState } from 'react';
import { auth, getFirebaseToken } from '../firebase';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function OrderHistory({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const token = await getFirebaseToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/transactions/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-4">Loading orders...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Order History</h1>
        <button onClick={onBack} className="text-blue-600">Back to Dashboard</button>
      </div>
      {transactions.length === 0 ? (
        <p>No completed orders yet.</p>
      ) : (
        <div className="space-y-4">
          {transactions.map(tx => (
            <div key={tx.id} className="border rounded-lg p-4 shadow-sm">
              <p><strong>Crop:</strong> {tx.crop_name || tx.listing_id}</p>
              <p><strong>Amount:</strong> ${tx.final_price}</p>
              <p><strong>Status:</strong> {tx.status}</p>
              <p><strong>Completed:</strong> {new Date(tx.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}