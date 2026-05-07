import React, { useState } from 'react';
import FarmerDashboard from './components/FarmerDashboard';
import DriverDashboard from './components/DriverDashboard';
import BuyerDashboard from './components/BuyerDashboard';

function App() {
  const [role, setRole] = useState(null); // 'farmer', 'driver', 'buyer'

  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-green-800 mb-2">ZimAgriChain</h1>
          <p className="text-center text-gray-600 mb-8">Zimbabwe's Agricultural Marketplace</p>
          <div className="space-y-4">
            <button
              onClick={() => setRole('farmer')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition"
            >
              I am a Farmer
            </button>
            <button
              onClick={() => setRole('driver')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition"
            >
              I am a Driver / Transporter
            </button>
            <button
              onClick={() => setRole('buyer')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition"
            >
              I am a Buyer (Market / Processor)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render respective dashboard
  if (role === 'farmer') return <FarmerDashboard onBack={() => setRole(null)} />;
  if (role === 'driver') return <DriverDashboard onBack={() => setRole(null)} />;
  if (role === 'buyer') return <BuyerDashboard onBack={() => setRole(null)} />;
}

export default App;