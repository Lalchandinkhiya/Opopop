import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LeaderboardItem } from '../../types';
import { Crown, Trophy, Medal, ArrowLeft, TrendingUp, Sparkles } from 'lucide-react';
import { audio } from '../../services/audioService';

interface LeaderboardViewProps {
  onBack?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const { user, wallet, setActiveTab } = useAuth();
  const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'ALL_TIME'>('WEEKLY');
  const [items, setItems] = useState<LeaderboardItem[]>([]);

  useEffect(() => {
    api.getLeaderboard(period).then(setItems);
  }, [period]);

  const top1 = items.find((i) => i.rank === 1);
  const top2 = items.find((i) => i.rank === 2);
  const top3 = items.find((i) => i.rank === 3);
  const rest = items.filter((i) => i.rank > 3);

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-28 text-left space-y-4">
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
          LEADERBOARD
        </span>
      </div>

      {/* Tabs: Weekly, Monthly, All Time */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#141724] border border-white/5">
        {(['WEEKLY', 'MONTHLY', 'ALL_TIME'] as const).map((p) => (
          <button
            key={p}
            onClick={() => {
              audio.playClick();
              setPeriod(p);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              period === p
                ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 font-black'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            {p === 'WEEKLY' ? 'Weekly' : p === 'MONTHLY' ? 'Monthly' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="relative pt-8 pb-3 px-2 rounded-3xl bg-gradient-to-b from-[#1C2034] via-[#121422] to-[#0A0C13] border border-[#D4AF37]/30 shadow-2xl flex items-end justify-center gap-3">
        {/* 2nd Place */}
        {top2 && (
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-2">
              <div className="w-14 h-14 rounded-2xl bg-slate-400/20 border-2 border-slate-300 p-0.5 shadow-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white font-mono">
                  {top2.name.slice(0, 1)}
                </span>
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-300 text-black text-[10px] font-black">
                2
              </span>
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[80px] mt-1">
              {top2.name}
            </span>
            <span className="text-xs font-black font-mono text-[#F5C542]">
              ₹{top2.rewardAmount.toLocaleString()}
            </span>
            <div className="w-full h-16 mt-2 rounded-t-2xl bg-gradient-to-t from-white/10 to-slate-400/20 border-t border-slate-400/30" />
          </div>
        )}

        {/* 1st Place (Center, Tallest) */}
        {top1 && (
          <div className="flex flex-col items-center flex-1 relative -top-3">
            <Crown className="w-7 h-7 text-[#F5C542] animate-bounce mb-1" />
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#997A15] via-[#F5C542] to-[#FFE885] p-0.5 shadow-xl shadow-[#D4AF37]/30 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-[#121420] flex items-center justify-center text-xl font-black text-[#F5C542] font-mono">
                  {top1.name.slice(0, 1)}
                </div>
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-black text-[10px] font-black shadow-md">
                1
              </span>
            </div>
            <span className="text-xs font-extrabold text-white truncate max-w-[90px] mt-1">
              {top1.name}
            </span>
            <span className="text-sm font-black font-mono text-[#F5C542]">
              ₹{top1.rewardAmount.toLocaleString()}
            </span>
            <div className="w-full h-24 mt-2 rounded-t-2xl bg-gradient-to-t from-[#D4AF37]/20 to-[#F5C542]/30 border-t border-[#D4AF37]/50" />
          </div>
        )}

        {/* 3rd Place */}
        {top3 && (
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-700/20 border-2 border-amber-600 p-0.5 shadow-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white font-mono">
                  {top3.name.slice(0, 1)}
                </span>
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black">
                3
              </span>
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[80px] mt-1">
              {top3.name}
            </span>
            <span className="text-xs font-black font-mono text-[#F5C542]">
              ₹{top3.rewardAmount.toLocaleString()}
            </span>
            <div className="w-full h-12 mt-2 rounded-t-2xl bg-gradient-to-t from-white/10 to-amber-700/20 border-t border-amber-600/30" />
          </div>
        )}
      </div>

      {/* Rank Table (4th to 8th) */}
      <div className="rounded-2xl bg-[#131622] border border-white/5 divide-y divide-white/5 overflow-hidden">
        {rest.map((item) => (
          <div key={item.rank} className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 text-xs font-mono font-bold text-[#9CA3AF] text-center">
                {item.rank}
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#1A1F30] border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                {item.name.slice(0, 1)}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {item.name}
                </span>
                <span className="text-[10px] text-[#9CA3AF] font-mono">
                  {item.memberId}
                </span>
              </div>
            </div>

            <span className="text-xs font-black font-mono text-white">
              ₹{item.rewardAmount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Bar for Current User */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-4 z-30">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#1E2338] via-[#1A1E2F] to-[#121422] border-2 border-[#D4AF37]/40 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-black text-xs">
              12
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-xs font-bold text-[#F5C542]">
              {user?.fullName?.slice(0, 1) || 'Y'}
            </div>
            <div>
              <span className="text-xs font-bold text-white block leading-tight">
                {user?.fullName || 'You'} (You)
              </span>
              <span className="text-[10px] text-[#9CA3AF] font-mono">
                {user?.memberId}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black font-mono text-[#F5C542]">
              ₹{wallet?.availableGameCredits.toLocaleString() ?? '850'}
            </span>
            <span className="text-[9px] text-emerald-400 block font-semibold">
              Top 15%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
