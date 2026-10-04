import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import { X, Lock, Smartphone, ShieldCheck, AlertCircle, ArrowRight, Zap, UserPlus } from 'lucide-react';
import { audio } from '../../services/audioService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToSignup }) => {
  const { login, loginWithGoogle, quickGuestLogin } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your Mobile Number or Member ID.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await login(identifier, password || 'demo123');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials or create a new account.');
      audio.playLoss();
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (type: 'MEMBER' | 'ADMIN') => {
    audio.playClick();
    if (type === 'MEMBER') {
      setIdentifier('RL-7770');
      setPassword('demo123');
    } else {
      setIdentifier('RL-ADMIN-01');
      setPassword('admin123');
    }
    setError(null);
  };

  const handle1TapGuest = async () => {
    setIsLoading(true);
    try {
      await quickGuestLogin();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Instant guest creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#11131C] border border-[#D4AF37]/35 shadow-2xl p-6 text-left overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <BrandLogo size="md" />
          <h2 className="text-lg font-display font-bold text-white mt-3">Member Sign In</h2>
          <p className="text-xs text-[#9CA3AF]">
            Login with Mobile Number or Organisation Member ID
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#D1D5DB] uppercase tracking-wider mb-1">
              Mobile Number or Member ID
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. 9123456780 or RL-7770"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full h-11 px-3.5 pl-10 rounded-xl bg-[#171B28] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                required
              />
              <Smartphone className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-[#D1D5DB] uppercase tracking-wider">
                Password
              </label>
              <span className="text-[10px] text-[#9CA3AF]">Default: demo123</span>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 pl-10 rounded-xl bg-[#171B28] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              />
              <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl gold-gradient-btn shadow-md shadow-[#D4AF37]/20 text-sm font-bold flex items-center justify-center gap-2 mt-2 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Google Firebase Login */}
        <div className="mt-3">
          <button
            type="button"
            onClick={async () => {
              try {
                setIsLoading(true);
                await loginWithGoogle();
                onClose();
              } catch (e: any) {
                setError(e.message || 'Google Sign-In failed');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-2.5 transition-colors shadow-md active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google (Firebase)</span>
          </button>
        </div>

        {/* Quick Instant Demo Logins */}
        <div className="mt-4 pt-3.5 border-t border-white/5 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold">
            One-Click Instant Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('MEMBER')}
              className="px-2.5 py-1.5 rounded-lg bg-[#191D2C] border border-white/5 text-[11px] text-[#E5E7EB] hover:border-[#D4AF37]/40 text-left transition-colors"
            >
              <span className="font-semibold text-[#F5C542] block">Demo Member</span>
              <span className="text-[9px] text-[#9CA3AF]">RL-7770 · 50 Credits</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="px-2.5 py-1.5 rounded-lg bg-[#191D2C] border border-white/5 text-[11px] text-[#E5E7EB] hover:border-[#D4AF37]/40 text-left transition-colors"
            >
              <span className="font-semibold text-emerald-400 block">Admin Console</span>
              <span className="text-[9px] text-[#9CA3AF]">RL-ADMIN-01</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handle1TapGuest}
            disabled={isLoading}
            className="w-full py-2 rounded-xl bg-[#181B2A] border border-white/5 text-xs text-[#D1D5DB] hover:text-white hover:border-[#D4AF37]/30 transition-colors flex items-center justify-center gap-1.5 mt-1"
          >
            <Zap className="w-3.5 h-3.5 text-[#F5C542] fill-current" />
            <span>Create Instant New Guest Account (+50 Credits)</span>
          </button>
        </div>

        {/* Switch to Signup */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[#9CA3AF]">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onSwitchToSignup();
              }}
              className="text-[#F5C542] font-semibold hover:underline"
            >
              Create Account (Sign Up)
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
