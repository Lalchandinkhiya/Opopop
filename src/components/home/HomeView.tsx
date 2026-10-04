import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GAME_CATALOG } from '../games/gameList';
import { api } from '../../services/api';
import { LedgerEntry } from '../../types';
import {
  Sparkles,
  Play,
  Wallet as WalletIcon,
  FileText,
  AlertCircle,
  Crown,
  Gift,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Lock,
  PlusCircle,
  Timer,
  Dices,
  Users,
  CheckSquare,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { audio } from '../../services/audioService';

export const HomeView: React.FC = () => {
  const {
    user,
    wallet,
    setActiveTab,
    setActiveGameId,
    setShowAddCreditsModal,
  } = useAuth();

  const [recentLedgers, setRecentLedgers] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    if (user) {
      api.getLedger(user.id).then((items) => {
        setRecentLedgers(items.slice(0, 4));
      });
    }
  }, [user, wallet]);

  const hasDeposited = (wallet?.totalDepositsCount ?? 0) > 0;
  const popularGames = GAME_CATALOG.filter((g) => g.isPopular).slice(0, 6);

  return (
    <div className="max-w-md mx-auto px-4 pt-2 pb-24 space-y-4 text-left">
      {/* 1. User Header Card (Screen 7) */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#171B2B] to-[#11131C] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#997A15] via-[#F5C542] to-[#FFE885] p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#121420] flex items-center justify-center text-lg font-bold text-[#F5C542] font-mono">
              {user?.fullName?.slice(0, 1) || 'U'}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              {user?.fullName || 'Valued Member'}
            </h3>
            <span className="text-[11px] text-[#9CA3AF] font-mono">
              ID: {user?.memberId || 'RL-NEW'}
            </span>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-[10px] font-black text-amber-300 flex items-center gap-1">
          <Crown className="w-3 h-3 text-[#F5C542]" />
          <span>VIP 1</span>
        </div>
      </div>

      {/* 2. Main Wallet Balance Card (Screen 7) */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-br from-[#1C2034] via-[#121422] to-[#0A0C13] border border-[#D4AF37]/35 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5C542]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider block">
                TOTAL BALANCE
              </span>
              <div className="text-3xl font-black font-mono text-white tracking-tight mt-0.5">
                ₹{wallet?.availableGameCredits.toLocaleString() ?? '50'}.00
              </div>
            </div>

            <button
              onClick={() => {
                audio.playChip();
                setShowAddCreditsModal(true);
              }}
              className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-bold shadow-md shadow-[#D4AF37]/20 active:scale-95 transition-transform"
            >
              Add Money
            </button>
          </div>

          {/* 4 Quick Actions: Deposit, Withdraw, Tasks, Refer (Screen 7) */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5">
            <button
              onClick={() => {
                audio.playChip();
                setShowAddCreditsModal(true);
              }}
              className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#171B28] border border-white/10 group-hover:border-[#D4AF37] flex items-center justify-center text-[#F5C542] shadow-sm">
                <PlusCircle className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[10px] font-bold text-white">Deposit</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                setActiveTab('WITHDRAW' as any);
              }}
              className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#171B28] border border-white/10 group-hover:border-[#D4AF37] flex items-center justify-center text-emerald-400 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-white">Withdraw</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                setActiveTab('TASKS' as any);
              }}
              className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#171B28] border border-white/10 group-hover:border-[#D4AF37] flex items-center justify-center text-purple-400 shadow-sm">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-white">Tasks</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                setActiveTab('REFER' as any);
              }}
              className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#171B28] border border-white/10 group-hover:border-[#D4AF37] flex items-center justify-center text-sky-400 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-white">Refer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Welcome Bonus Banner (Screen 7) */}
      <div className="relative rounded-3xl p-4 bg-gradient-to-r from-[#241A44] via-[#1B1832] to-[#121320] border border-[#D4AF37]/35 shadow-xl flex items-center justify-between overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
              NEW MEMBER
            </span>
          </div>
          <h4 className="text-base font-black text-white">
            Welcome Bonus <span className="text-[#F5C542]">₹50</span>
          </h4>
          <p className="text-[11px] text-[#9CA3AF]">
            Start Playing & Earning Now!
          </p>
        </div>

        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#131522] flex items-center justify-center">
              <Gift className="w-7 h-7 text-[#F5C542] animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Winners Ticker */}
      <div className="rounded-2xl p-2.5 bg-[#131622] border border-white/5 flex items-center gap-2 overflow-hidden shadow-sm">
        <div className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-black flex items-center gap-1 shrink-0">
          <Crown className="w-3 h-3 text-[#F5C542]" />
          <span>WINS</span>
        </div>
        <div className="text-xs font-mono text-white truncate animate-pulse">
          🔥 Member RL-4819 won ₹2,450.00 in Win Go · Member 98***721 won ₹5,800.00 in K3 · Member RL-2309 won ₹14,200 in Slots!
        </div>
      </div>

      {/* 5. Popular Games (Screen 7) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
            POPULAR GAMES
          </h3>
          <button
            onClick={() => setActiveTab('GAMES')}
            className="text-xs text-[#F5C542] font-semibold hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {popularGames.map((game) => {
            const isSlotLocked = game.requiresDeposit && !hasDeposited;
            return (
              <div
                key={game.id}
                className="group relative rounded-2xl p-3.5 bg-[#131622] border border-white/5 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between text-left overflow-hidden shadow-md"
              >
                {isSlotLocked && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Locked</span>
                  </div>
                )}

                <div>
                  <div
                    className="w-10 h-10 rounded-xl mb-2.5 flex items-center justify-center font-bold text-sm shadow-md"
                    style={{ backgroundColor: `${game.accentColor}25`, color: game.accentColor }}
                  >
                    ◈
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#F5C542] transition-colors leading-tight">
                    {game.name}
                  </h4>
                  <p className="text-[10px] text-[#9CA3AF] line-clamp-2 mt-0.5">
                    {game.shortDescription}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-[#9CA3AF] font-mono">
                    Min: <strong className="text-white">₹{game.minCredits}</strong>
                  </span>
                  <button
                    onClick={() => {
                      if (isSlotLocked) {
                        setShowAddCreditsModal(true);
                      } else {
                        audio.playClick();
                        setActiveGameId(game.id);
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold active:scale-95 transition-transform ${
                      isSlotLocked
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'gold-gradient-btn'
                    }`}
                  >
                    {isSlotLocked ? 'UNLOCK' : 'PLAY'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
