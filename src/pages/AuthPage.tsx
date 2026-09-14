import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { Cloud, Lock, User as UserIcon, CheckCircle, AlertCircle, LogOut } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (auth) {
      const unsub = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsub();
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setMessage({
        text: 'Firebase is running in local-first mode. Add credentials in .env to enable remote sync.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage({ text: 'Account registered and synchronized!', type: 'success' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage({ text: 'Signed in successfully!', type: 'success' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      setMessage({ text: 'Signed out.', type: 'success' });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface-950 overflow-y-auto p-6 max-w-xl space-y-6">
      <div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Cloud className="w-5 h-5 text-brand-400" />
          Firebase Cloud Synchronization &amp; Auth
        </h2>
        <p className="text-xs text-surface-400 mt-1">
          Synchronize task groups, proxy pools, and client-encrypted billing profiles across multiple machines.
        </p>
      </div>

      {/* Cloud Status Card */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-surface-400">Cloud Status:</span>
          <span
            className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
              isFirebaseConfigured
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            {isFirebaseConfigured ? 'CONNECTED' : 'LOCAL-FIRST (UNRESTRICTED)'}
          </span>
        </div>
        <p className="text-[11px] text-surface-500 leading-relaxed">
          {isFirebaseConfigured
            ? 'Firebase client initialized. All sensitive payment details remain locally AES-256-GCM encrypted before cloud synchronization.'
            : 'Blank runs 100% locally with zero required cloud configurations. To enable cross-device cloud sync, add your Firebase keys to .env.'}
        </p>
      </div>

      {user ? (
        /* Authenticated View */
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{user.email}</div>
              <div className="text-[11px] text-surface-500 font-mono">UID: {user.uid}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-surface-800">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-surface-800 hover:bg-rose-600/20 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        /* Login / Sign-up Form */
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-800 pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {isSignUp ? 'Create Cloud Account' : 'Sign In with Firebase'}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-brand-400 hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/20"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up & Sync' : 'Sign In'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
