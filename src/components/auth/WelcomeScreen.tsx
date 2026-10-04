import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { Gift, ArrowRight, ShieldCheck } from 'lucide-react';
import { audio } from '../../services/audioService';

interface WelcomeScreenProps {
  onStartPlaying: () => void;
  memberId?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartPlaying, memberId = 'RL-NEW' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1C2030] via-[#12141F] to-[#0A0C13] border border-[#D4AF37]/40 shadow-2xl p-6 text-center overflow-hidden">
        {/* Ambient gold glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#F5C542]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="flex justify-center mb-4">
          <BrandLogo size="lg" />
        </div>

        <h2 className="text-xl font-display font-bold text-white mb-1">
          Welcome to the organisation gaming platform
        </h2>
        <p className="text-xs text-[#9CA3AF] mb-6">
          Member ID: <span className="text-[#F5C542] font-mono font-semibold">{memberId}</span>
        </p>

        {/* 50 Game Credits Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#242A3E]/70 to-[#161926]/90 border border-[#D4AF37]/30 shadow-inner mb-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-[#997A15] via-[#F5C542] to-[#FFF1B8] flex items-center justify-center text-2xl shadow-lg mb-3">
            <Gift className="w-7 h-7 text-black stroke-[2.2]" />
          </div>

          <div className="text-2xl font-black font-display text-white tracking-wide mb-1">
            ₹50 WELCOME BONUS
          </div>
          <p className="text-xs text-[#E5E7EB] leading-relaxed mb-3">
            You have received ₹50 Free balance as your organisation signup bonus.
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/5 text-[11px] text-[#9CA3AF]">
            <ShieldCheck className="w-3 h-3 text-[#F5C542]" />
            <span>Instant ₹50 Signup Grant · Ready to Play</span>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => {
            audio.playClick();
            onStartPlaying();
          }}
          className="w-full h-12 rounded-xl gold-gradient-btn shadow-lg shadow-[#D4AF37]/25 text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>START PLAYING</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
