import React, { useRef, useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login({ onSwitchToSignup }) {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    if (!email || !password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    const email = emailRef.current.value;
    if (!email) {
      setError('Enter your email address first');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setError('');
    } catch (err) {
      setError('Failed to send reset email. Check the email address.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      {resetEmailSent && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">Password reset email sent. Check your inbox.</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input ref={emailRef} type="email" defaultValue="" required autoComplete="new-email" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <div className="relative">
            <input ref={passwordRef} type={showPassword ? "text" : "password"} defaultValue="" required autoComplete="new-password" className="w-full border rounded px-3 py-2 pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600">
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <button type="button" onClick={handleForgotPassword} className="text-sm text-blue-600 hover:underline">Forgot password?</button>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-center mt-4 text-sm">
        New user? <button onClick={onSwitchToSignup} className="text-green-600">Sign up</button>
      </p>
    </div>
  );
}