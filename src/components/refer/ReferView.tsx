import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ReferralInfo } from '../../types';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Coins,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface ReferViewProps {
  onBack?: () => void;
}

export const ReferView: React.FC<ReferViewProps> = ({ onBack }) => {
  const { user, setActiveTab } = useAuth();
  const [refInfo, setRefInfo] = useState<ReferralInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      api.getReferralInfo(user.id).then(setRefInfo);
    }
  }, [user]);

  const referralCode = refInfo?.referralCode || user?.memberId || 'RL-VIP';
  const shareText = `Join me on RECOVERY LOSSS! Use my exclusive invitation code ${referralCode} to get ₹50 Welcome Bonus instantly. Play real games and earn!`;

  const handleCopy = () => {
    audio.playClick();
    navigator.clipboard?.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: 'whatsapp' | 'telegram' | 'facebook' | 'native') => {
    audio.playClick();
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=https://recoverylosss.app&text=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://recoverylosss.app')}`, '_blank');
    } else {
      if (navigator.share) {
        navigator.share({ title: 'RECOVERY LOSSS', text: shareText, url: window.location.href }).catch(() => {});
      } else {
        handleCopy();
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 text-left space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            audio.playClick();
            if (onBack) onBack();
            else setActiveTab('HOME');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141724] border border-white/5 text-xs text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
          REFER & EARN
        </span>
      </div>

      {/* Visual Card with Chest */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-b from-[#241A44] via-[#16172A] to-[#0D0F18] border border-[#D4AF37]/35 shadow-2xl text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#F5C542]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#997A15] via-[#F5C542] to-[#FFF1B8] p-1 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-[#10121C] flex items-center justify-center">
              <Gift className="w-10 h-10 text-[#F5C542] stroke-[2.2] animate-bounce" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-display font-black text-white">
              Invite Friends & Earn
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-1">
              Get <strong className="text-[#F5C542]">₹20</strong> for each successful referral that makes their first deposit.
            </p>
          </div>

          {/* Referral Code Box */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-1.5">
              YOUR REFERRAL CODE
            </span>
            <div className="flex items-center justify-between p-2 rounded-2xl bg-[#0C0E16] border border-white/10">
              <span className="font-mono font-black text-lg text-[#F5C542] tracking-wider pl-3">
                {referralCode}
              </span>
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-2">
              SHARE NOW
            </span>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleShare('whatsapp')}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex flex-col items-center gap-1 shadow-md transition-colors"
              >
                <span className="text-sm">💬</span>
                <span className="text-[10px]">WhatsApp</span>
              </button>
              <button
                onClick={() => handleShare('telegram')}
                className="py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex flex-col items-center gap-1 shadow-md transition-colors"
              >
                <span className="text-sm">✈️</span>
                <span className="text-[10px]">Telegram</span>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold flex flex-col items-center gap-1 shadow-md transition-colors"
              >
                <span className="text-sm">📘</span>
                <span className="text-[10px]">Facebook</span>
              </button>
              <button
                onClick={() => handleShare('native')}
                className="py-2.5 rounded-xl bg-[#23283E] hover:bg-[#2B314C] text-white text-xs font-bold flex flex-col items-center gap-1 shadow-md transition-colors"
              >
                <Share2 className="w-4 h-4 text-[#F5C542]" />
                <span className="text-[10px]">More</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3.5 rounded-2xl bg-[#131622] border border-white/5">
          <span className="text-2xl font-black font-mono text-white block">
            {refInfo?.totalInvited ?? 25}
          </span>
          <span className="text-[10px] text-[#9CA3AF] uppercase font-semibold">
            Total Invited
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#131622] border border-white/5">
          <span className="text-2xl font-black font-mono text-[#F5C542] block">
            ₹{refInfo?.totalEarned ?? 500}
          </span>
          <span className="text-[10px] text-[#9CA3AF] uppercase font-semibold">
            Total Earned
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#131622] border border-white/5">
          <span className="text-2xl font-black font-mono text-emerald-400 block">
            {refInfo?.activeFriends ?? 10}
          </span>
          <span className="text-[10px] text-[#9CA3AF] uppercase font-semibold">
            Active Friends
          </span>
        </div>
      </div>

      {/* How it Works */}
      <div className="p-4 rounded-2xl bg-[#131622] border border-white/5 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#F5C542]" />
          <span>How Referral Bonus Works</span>
        </h4>
        <div className="space-y-2 text-xs text-[#9CA3AF]">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#1F2438] text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
            <p>Send your personal invitation code to friends via WhatsApp or Telegram.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#1F2438] text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
            <p>Your friend registers and instantly receives ₹50 Signup Welcome Bonus.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#1F2438] text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
            <p>Once your friend makes their first deposit, you receive ₹20 real balance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
