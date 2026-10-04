import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GAME_CATALOG } from './gameList';
import { GameCard } from './GameCard';
import { GameCategory } from '../../types';
import { WinGoGame } from './WinGoGame';
import { K3LotteryGame } from './K3LotteryGame';
import { LuckySlotsGame } from './LuckySlotsGame';
import { RoyalRouletteGame } from './RoyalRouletteGame';
import { BlackjackGame } from './BlackjackGame';
import { TeenPattiGame } from './TeenPattiGame';
import { AndarBaharGame } from './AndarBaharGame';
import { AviatorCrashGame } from './AviatorCrashGame';
import { MinesGame } from './MinesGame';
import { Dices, Search, Lock, PlusCircle, X, Sparkles, Flame, Volume2, Trophy } from 'lucide-react';
import { audio } from '../../services/audioService';

const CATEGORIES: Array<{ key: GameCategory; label: string; icon: string }> = [
  { key: 'ALL', label: 'All Games (सभी)', icon: '🔥' },
  { key: 'LOTTERY', label: 'Lottery (लॉटरी)', icon: '🎰' },
  { key: 'SLOTS', label: 'VIP Slots (स्लॉट्स)', icon: '👑' },
  { key: 'ARCADE', label: 'Original & Crash', icon: '🚀' },
  { key: 'CARDS', label: 'Cards (ताश)', icon: '♠️' },
  { key: 'WHEEL', label: 'Roulette (पहिया)', icon: '🎯' },
];

export const GameLobby: React.FC = () => {
  const { activeGameId, setActiveGameId, wallet, setShowAddCreditsModal } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSlotLockModal, setShowSlotLockModal] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  const winningTicker = [
    '🔥 Member RL-4819 won ₹2,450.00 in Win Go 1Min',
    '🔥 Member 98***721 won ₹5,800.00 in K3 Lottery',
    '🔥 Member RL-2309 won ₹14,200.00 in Lucky Slots VIP',
    '🔥 Member 91***104 won ₹3,750.00 in Aviator Crash',
    '🔥 Member RL-8832 won ₹7,900.00 in Mines Cashout',
    '🔥 Member RL-1945 won ₹4,500.00 in Teen Patti Classic',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % winningTicker.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [winningTicker.length]);

  const hasDeposited = (wallet?.totalDepositsCount ?? 0) > 0;

  // Active game screens
  if (activeGameId) {
    if (activeGameId === 'wingo') {
      return <WinGoGame onBack={() => setActiveGameId(null)} />;
    }
    if (activeGameId === 'k3') {
      return <K3LotteryGame onBack={() => setActiveGameId(null)} />;
    }
    if (activeGameId === 'aviator') {
      return <AviatorCrashGame onBack={() => setActiveGameId(null)} />;
    }
    if (activeGameId === 'mines') {
      return <MinesGame onBack={() => setActiveGameId(null)} />;
    }
    if (activeGameId === 'lucky_slots' || activeGameId === 'jackpot_slots') {
      if (!hasDeposited) {
        setActiveGameId(null);
        setShowSlotLockModal(true);
        return null;
      }
      return <LuckySlotsGame onBack={() => setActiveGameId(null)} />;
    }
    if (activeGameId === 'royal_roulette' || activeGameId === 'lucky_wheel') {
      return <RoyalRouletteGame onBack={() => setActiveGameId(null)} />;
    }
    if (activeGameId === 'blackjack') {
      return <BlackjackGame onBack={() => setActiveGameId(null)} />;
    }
    if (activeGameId === 'teen_patti') {
      return <TeenPattiGame onBack={() => setActiveGameId(null)} />;
    }
    if (activeGameId === 'andar_bahar') {
      return <AndarBaharGame onBack={() => setActiveGameId(null)} />;
    }
    return <WinGoGame onBack={() => setActiveGameId(null)} />;
  }

  const filteredGames = GAME_CATALOG.filter((game) => {
    const matchesCategory =
      selectedCategory === 'ALL' || game.category === selectedCategory;
    const matchesSearch =
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 pt-3 pb-24 space-y-4 text-left">
      {/* Tiranga Live Winner Announcement Ticker */}
      <div className="rounded-2xl p-2.5 bg-gradient-to-r from-[#171B2A] via-[#1A2136] to-[#121524] border border-[#D4AF37]/30 flex items-center gap-2 overflow-hidden shadow-md">
        <div className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Trophy className="w-3 h-3 text-[#F5C542]" />
          <span>WINNERS</span>
        </div>
        <div className="text-xs font-semibold text-white font-mono truncate transition-all duration-300">
          {winningTicker[tickerIndex]}
        </div>
      </div>

      {/* Lobby Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
            <Dices className="w-5 h-5 text-[#F5C542]" />
            ORGANISATION GAME LOBBY
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Win Go, K3 Lottery, Aviator, Mines, Slots & Card Tables · Real ₹ Rupee Balances
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-3 pl-9 rounded-xl bg-[#141724] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#D4AF37]"
          />
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              audio.playClick();
              setSelectedCategory(cat.key);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.key
                ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20'
                : 'bg-[#151824] text-[#9CA3AF] hover:text-white border border-white/5'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {filteredGames.map((game) => {
          const isSlotLocked = game.requiresDeposit && !hasDeposited;
          return (
            <GameCard
              key={game.id}
              game={game}
              isLocked={isSlotLocked}
              onPlay={(id) => setActiveGameId(id)}
              onLockedClick={() => setShowSlotLockModal(true)}
            />
          );
        })}
      </div>

      {/* Deposit Required for Slots Modal */}
      {showSlotLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#11131C] border-2 border-amber-500/40 p-6 text-center space-y-4 shadow-2xl">
            <button
              onClick={() => setShowSlotLockModal(false)}
              className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
                Slots Locked - Deposit Required
              </h3>
              <p className="text-xs text-[#D1D5DB] mt-1 leading-relaxed">
                As per organisation rules, VIP Slots are unlocked only after making your first deposit (Min ₹55).
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setShowSlotLockModal(false);
                  audio.playChip();
                  setShowAddCreditsModal(true);
                }}
                className="w-full h-12 rounded-xl gold-gradient-btn text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#D4AF37]/20 active:scale-95 transition-transform"
              >
                <PlusCircle className="w-4 h-4 fill-current" />
                <span>Deposit Now (Min ₹55 Demo)</span>
              </button>
              <button
                onClick={() => setShowSlotLockModal(false)}
                className="text-xs text-[#9CA3AF] hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

