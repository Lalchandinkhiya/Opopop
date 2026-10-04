import React, { useState } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { ShieldCheck, Users, Lock, Sparkles, UserPlus, LogIn, Zap } from 'lucide-react';
import { audio } from '../../services/audioService';

interface SplashScreenProps {
  onLogin: () => void;
  onSignup: () => void;
  onQuickGuest: () => void;
  onAdminLogin: () => void;
  totalMembers?: number;
  maxMembers?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onLogin,
  onSignup,
  onQuickGuest,
  onAdminLogin,
  totalMembers = 347,
  maxMembers = 500,
}) => {
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleGuestClick = async () => {
    setIsGuestLoading(true);
    try {
      await onQuickGuest();
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between items-center px-4 py-8 max-w-md mx-auto text-center">
      {/* Background radial gold glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Badge: Invite-only Organisation */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121520] border border-[#D4AF37]/30 text-xs text-[#E5E7EB]">
        <Lock className="w-3.5 h-3.5 text-[#F5C542]" />
        <span>Organisation Platform</span>
        <span className="text-[#9CA3AF]">·</span>
        <span className="font-mono text-[#F5C542] font-semibold">
          {totalMembers} / {maxMembers} Members
        </span>
      </div>

      {/* Center Brand & Emblem */}
      <div className="my-auto flex flex-col items-center py-4">
        <div className="mb-5 transform hover:scale-105 transition-transform duration-300">
          <BrandLogo size="xl" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-wide text-white mb-2 text-balance">
          Private Member Gaming Guild
        </h1>
        <p className="text-xs sm:text-sm text-[#9CA3AF] max-w-xs leading-relaxed mb-6">
          Virtual game credits, 18 casino tables, immutable ledger audit trails, and modular settlement architecture.
        </p>

        {/* Highlight Perks Grid */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6 text-left">
          <div className="p-3 rounded-xl bg-[#141724]/80 border border-[#D4AF37]/20 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5C542]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>₹50 Signup Bonus</span>
            </div>
            <p className="text-[11px] text-[#9CA3AF]">Free bonus for every new player</p>
          </div>

          <div className="p-3 rounded-xl bg-[#141724]/80 border border-[#D4AF37]/20 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Win Go & K3</span>
            </div>
            <p className="text-[11px] text-[#9CA3AF]">Live 1-Min Lottery & Fast Payouts</p>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons: Sign In, Sign Up, Quick Guest */}
      <div className="w-full space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Sign In Button */}
          <button
            onClick={() => {
              audio.playClick();
              onLogin();
            }}
            className="h-12 rounded-xl bg-[#171B28] hover:bg-[#1E2336] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            <LogIn className="w-4 h-4 text-[#F5C542]" />
            <span>Login (लॉगिन)</span>
          </button>

          {/* Sign Up / Create Account Button */}
          <button
            onClick={() => {
              audio.playClick();
              onSignup();
            }}
            className="h-12 rounded-xl gold-gradient-btn shadow-lg shadow-[#D4AF37]/20 text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Register (रजिस्टर)</span>
          </button>
        </div>

        {/* 1-Tap Quick Guest Play */}
        <button
          onClick={handleGuestClick}
          disabled={isGuestLoading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-[#191D2C] via-[#202538] to-[#191D2C] border border-white/10 hover:border-[#D4AF37]/50 text-xs font-semibold text-[#F3F4F6] flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-[#F5C542] fill-current" />
          <span>{isGuestLoading ? 'Launching Instant Session...' : 'Instant 1-Tap Play (₹50 Free Demo)'}</span>
        </button>
      </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-center gap-4 text-xs text-[#9CA3AF] pt-2">
          <button
            onClick={() => {
              audio.playClick();
              onAdminLogin();
            }}
            className="hover:text-[#F5C542] transition-colors underline decoration-dotted underline-offset-4"
          >
            Admin Authority Console
          </button>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#F5C542]" />
            Cap: {maxMembers} Max
          </span>
        </div>
      </div>
  );
};
