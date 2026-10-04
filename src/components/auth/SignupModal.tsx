import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import { api } from '../../services/api';
import { X, Lock, Smartphone, User, Key, AlertCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { audio } from '../../services/audioService';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { signup, loginWithGoogle, quickGuestLogin } = useAuth();
  const [fullName, setFullName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('VIP-RECOVERY-2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capacityInfo, setCapacityInfo] = useState<{ current: number; max: number }>({
    current: 347,
    max: 500,
  });

  useEffect(() => {
    if (isOpen) {
      api.getOrganisationConfig().then((cfg) => {
        setCapacityInfo({ current: cfg.currentMembers, max: cfg.maxMembers });
      });
      // Suggest a member ID if empty
      if (!memberId) {
        setMemberId(`RL-${Math.floor(1000 + Math.random() * 8999)}`);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password && confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        fullName: fullName.trim() || 'Guild Member',
        memberId: memberId.trim() || `RL-${Math.floor(1000 + Math.random() * 8999)}`,
        mobileNumber: mobileNumber.trim() || `98${Math.floor(10000000 + Math.random() * 89999999)}`,
        password,
        invitationCode: invitationCode.trim() || 'VIP-RECOVERY-2026',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please review your details.');
      audio.playLoss();
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    audio.playClick();
    const rand = Math.floor(1000 + Math.random() * 8999);
    setFullName(`Rohan Verma`);
    setMemberId(`RL-${rand}`);
    setMobileNumber(`98${rand}4321`);
    setPassword('pass123');
    setConfirmPassword('pass123');
    setInvitationCode('VIP-RECOVERY-2026');
    setError(null);
  };

  const handleInstant1Tap = async () => {
    setIsLoading(true);
    try {
      await quickGuestLogin();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-md my-8 rounded-3xl bg-[#11131C] border border-[#D4AF37]/35 shadow-2xl p-6 text-left overflow-hidden">
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
          <div className="flex items-center justify-between mt-3">
            <h2 className="text-lg font-display font-bold text-white">Create Account</h2>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-semibold text-[#F5C542] hover:underline flex items-center gap-1"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Auto-Fill Details</span>
            </button>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            Open Registration · Receive ₹50 Free Welcome Bonus on signup
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
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-10 px-3.5 pl-9 rounded-xl bg-[#171B28] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
                required
              />
              <User className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#D1D5DB] uppercase tracking-wider mb-1">
                Member ID
              </label>
              <input
                type="text"
                placeholder="RL-0000"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value.toUpperCase())}
                className="w-full h-10 px-3 rounded-xl bg-[#171B28] border border-white/10 text-[#F5C542] font-mono font-bold text-xs focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#D1D5DB] uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full h-10 px-3 pl-8 rounded-xl bg-[#171B28] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  required
                />
                <Smartphone className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-[#D1D5DB] uppercase tracking-wider">
                Invitation Code
              </label>
              <span className="text-[10px] text-emerald-400 font-mono">VIP Pass Active</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="VIP-RECOVERY-2026"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                className="w-full h-10 px-3.5 pl-9 rounded-xl bg-[#171B28] border border-[#D4AF37]/40 text-[#F5C542] font-mono font-bold tracking-wider text-xs focus:outline-none focus:border-[#D4AF37]"
              />
              <Key className="w-4 h-4 text-[#F5C542] absolute left-3 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-[#D1D5DB] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Min 4 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pl-8 rounded-xl bg-[#171B28] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  required
                />
                <Lock className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-3" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#D1D5DB] uppercase tracking-wider mb-1">
                Confirm
              </label>
              <input
                type="password"
                placeholder="Repeat pass"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#171B28] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#161A28] border border-white/5 flex items-center justify-between text-[11px] text-[#9CA3AF]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#F5C542] shrink-0" />
              <span>Slots Available: {capacityInfo.current} / {capacityInfo.max}</span>
            </div>
            <span className="text-emerald-400 font-bold">+50 Bonus</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl gold-gradient-btn shadow-md shadow-[#D4AF37]/20 text-sm font-bold flex items-center justify-center gap-2 mt-2 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>Creating Member Account...</span>
            ) : (
              <>
                <span>Sign Up & Claim ₹50 Free Bonus (₹50 बोनस)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Google Firebase Signup */}
        <div className="mt-3">
          <button
            type="button"
            onClick={async () => {
              try {
                setIsLoading(true);
                await loginWithGoogle();
                onClose();
              } catch (e: any) {
                setError(e.message || 'Google registration failed');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="w-full h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md active:scale-95 cursor-pointer"
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
            <span>Instant Register with Google (Firebase)</span>
          </button>
        </div>

        {/* 1-Tap Quick Guest */}
        <div className="mt-3">
          <button
            type="button"
            onClick={handleInstant1Tap}
            disabled={isLoading}
            className="w-full py-2 rounded-xl bg-[#181B2A] border border-white/5 text-xs text-[#D1D5DB] hover:text-white hover:border-[#D4AF37]/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-[#F5C542] fill-current" />
            <span>Or Skip Form: Instant 1-Tap Guest Access</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-[#9CA3AF]">
            Already an organisation member?{' '}
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onSwitchToLogin();
              }}
              className="text-[#F5C542] font-semibold hover:underline"
            >
              Sign In Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
