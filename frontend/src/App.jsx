import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './components/Login';
import Signup from './components/Signup';
import FarmerDashboard from './components/FarmerDashboard';
import DriverDashboard from './components/DriverDashboard';
import BuyerDashboard from './components/BuyerDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          let userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // Missing document – recreate it with default role?
            // We don't know their role, so we must ask them.
            // For simplicity, sign them out and require signup again.
            await auth.signOut();
            setError('Your profile was missing. Please sign up again.');
            setLoading(false);
            return;
          }

          const role = userDoc.data().role;
          const normalizedRole = role ? role.toString().toLowerCase().trim() : '';
          if (normalizedRole === 'farmer') {
            setUserRole('farmer');
          } else if (normalizedRole === 'driver') {
            setUserRole('driver');
          } else if (normalizedRole === 'buyer') {
            setUserRole('buyer');
          } else {
            setError(`Invalid role: "${role}". Please contact support.`);
          }
        } catch (err) {
          console.error(err);
          setError('Failed to load user data. Please refresh.');
        }
      } else {
        setUser(null);
        setUserRole(null);
        setError('');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
        <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded">Try Again</button>
      </div>
    );
  }

  if (!user) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    );
  }

  if (userRole === 'farmer') return <FarmerDashboard onBack={() => auth.signOut()} />;
  if (userRole === 'driver') return <DriverDashboard onBack={() => auth.signOut()} />;
  if (userRole === 'buyer') return <BuyerDashboard onBack={() => auth.signOut()} />;

  return <div>Role not recognized. Please contact support.</div>;
}

export default App;