import React, { useState } from 'react';
import { ArrowRight, Sparkles, Gift, Smartphone, Zap } from 'lucide-react';
import { audio } from '../../services/audioService';

interface OnboardingModalProps {
  isOpen: boolean;
  onFinish: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Play Real Games',
      description: 'Exciting games, real rewards and instant fun across VIP lottery and casino tables.',
      badge: 'PROVABLY FAIR',
      icon: (
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-red-500/20 rounded-full blur-2xl" />
          <div className="relative z-10 w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#997A15] via-[#F5C542] to-[#FFE885] p-1 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-[#121420] flex flex-col items-center justify-center text-center p-2">
              <span className="text-3xl font-black text-[#F5C542] tracking-wider font-mono">777</span>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest mt-1">SLOTS VIP</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Earn Rewards',
      description: 'Complete daily tasks, refer your friends and earn instant credit bonuses and prizes.',
      badge: 'TASK BOUNTIES',
      icon: (
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-2xl" />
          <div className="relative z-10 w-28 h-28 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-1 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-[#121420] flex flex-col items-center justify-center text-center p-2">
              <Gift className="w-10 h-10 text-[#F5C542] stroke-[2.2] animate-bounce" />
              <span className="text-[10px] font-bold text-pink-300 uppercase tracking-widest mt-1">₹50 BONUS</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Easy Payments',
      description: 'Add money securely using Razorpay, UPI, Paytm, Google Pay and bank options.',
      badge: '100% SECURE',
      icon: (
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-full blur-2xl" />
          <div className="relative z-10 w-28 h-28 rounded-3xl bg-gradient-to-tr from-emerald-500 via-[#F5C542] to-blue-500 p-1 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-[#121420] flex flex-col items-center justify-center text-center p-2">
              <span className="text-4xl font-black text-emerald-400 font-mono">₹</span>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mt-1">RAZORPAY</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const slide = slides[currentStep];

  const handleNext = () => {
    audio.playClick();
    if (currentStep < slides.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#181C2C] via-[#11131C] to-[#0A0C13] border border-[#D4AF37]/40 shadow-2xl p-6 text-center overflow-hidden flex flex-col justify-between min-h-[440px]">
        {/* Ambient glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#F5C542]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar with Skip button */}
        <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-[10px]">
            {slide.badge}
          </span>
          <button
            onClick={() => {
              audio.playClick();
              onFinish();
            }}
            className="hover:text-white transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Center Graphic & Title */}
        <div className="my-auto py-4 space-y-4">
          {slide.icon}

          <div className="space-y-1.5">
            <h2 className="text-2xl font-display font-black text-white tracking-wide">
              {slide.title}
            </h2>
            <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
              {slide.description}
            </p>
          </div>
        </div>

        {/* Bottom controls: 3 dots indicator & Next button */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep === idx ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full h-12 rounded-xl gold-gradient-btn text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/25 active:scale-95 transition-transform cursor-pointer"
          >
            <span>{currentStep === slides.length - 1 ? 'Get Started' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
