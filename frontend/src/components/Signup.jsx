import React, { useRef, useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const checkPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.match(/[a-z]/)) score++;
  if (password.match(/[A-Z]/)) score++;
  if (password.match(/[0-9]/)) score++;
  if (password.match(/[^a-zA-Z0-9]/)) score++;
  return score;
};

const getStrengthText = (score) => {
  if (score <= 2) return 'Weak';
  if (score === 3) return 'Fair';
  if (score === 4) return 'Good';
  return 'Strong';
};

export default function Signup({ onSwitchToLogin }) {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const [role, setRole] = useState('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [confirmPasswordMatch, setConfirmPasswordMatch] = useState(null);

  const handlePasswordChange = () => {
    const pwd = passwordRef.current?.value || '';
    setPasswordStrength(checkPasswordStrength(pwd));
    const confirm = confirmPasswordRef.current?.value || '';
    setConfirmPasswordMatch(confirm === pwd ? (pwd ? true : null) : false);
  };

  const handleConfirmChange = () => {
    const pwd = passwordRef.current?.value || '';
    const confirm = confirmPasswordRef.current?.value || '';
    setConfirmPasswordMatch(confirm === pwd ? (pwd ? true : null) : false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const confirm = confirmPasswordRef.current.value;

    if (!name || !email || !password || !confirm) {
      setError('All fields are required');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (passwordStrength < 3) {
      setError('Password is too weak. Use at least 8 chars with mixed case, numbers, and symbols.');
      return;
    }
    if (!email.includes('@')) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      });
      // Send email verification
      await sendEmailVerification(user);
      alert('Verification email sent. Please verify your email before logging in.');
      // Optionally sign out and go to login
      await auth.signOut();
      onSwitchToLogin();
    } catch (err) {
      let friendlyError = err.message;
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = 'This email is already registered. Please login.';
      }
      setError(friendlyError);
    }
    setLoading(false);
  };

  const strengthColorClass = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength === 3) return 'bg-orange-500';
    if (passwordStrength === 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Full Name</label>
          <input ref={nameRef} type="text" defaultValue="" required autoComplete="new-name" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input ref={emailRef} type="email" defaultValue="" required autoComplete="new-email" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <div className="relative">
            <input ref={passwordRef} type={showPassword ? "text" : "password"} defaultValue="" required autoComplete="new-password" className="w-full border rounded px-3 py-2 pr-10" onChange={handlePasswordChange} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600">
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {passwordStrength > 0 && (
            <div className="mt-1">
              <div className="h-2 w-full bg-gray-200 rounded">
                <div className={`h-2 rounded ${strengthColorClass()}`} style={{ width: `${(passwordStrength / 5) * 100}%` }}></div>
              </div>
              <p className={`text-xs mt-1 ${passwordStrength <= 2 ? 'text-red-600' : passwordStrength === 3 ? 'text-orange-600' : passwordStrength === 4 ? 'text-blue-600' : 'text-green-600'}`}>
                Strength: {getStrengthText(passwordStrength)}
              </p>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Confirm Password</label>
          <div className="relative">
            <input ref={confirmPasswordRef} type={showConfirmPassword ? "text" : "password"} defaultValue="" required autoComplete="new-password" className="w-full border rounded px-3 py-2 pr-10" onChange={handleConfirmChange} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600">
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {confirmPasswordMatch === false && <p className="text-red-600 text-xs mt-1">✗ Passwords do not match</p>}
          {confirmPasswordMatch === true && <p className="text-green-600 text-xs mt-1">✓ Passwords match</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">I am a</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="farmer">Farmer</option>
            <option value="driver">Driver / Transporter</option>
            <option value="buyer">Buyer (Market / Processor)</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      <p className="text-center mt-4 text-sm">
        Already have an account? <button onClick={onSwitchToLogin} className="text-blue-600">Login</button>
      </p>
    </div>
  );
}